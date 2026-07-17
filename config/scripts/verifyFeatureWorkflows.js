const crypto = require('crypto');
const mongoose = require('mongoose');

require('../config/env');

const Admin = require('../models/Admin');
const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const MemberCategory = require('../models/MemberCategory');
const MemberUpdateRequest = require('../models/MemberUpdateRequest');

const apiRoot = process.env.API_TEST_URL || 'http://127.0.0.1:5000/api';
const marker = `codex-${Date.now()}`;
const password = `Test!${crypto.randomBytes(10).toString('hex')}`;
const superEmail = `${marker}-provisioner@example.test`;
const adminEmail = `${marker}-admin@example.test`;
const memberEmail = `${marker}-member@example.test`;
const changedEmail = `${marker}-updated@example.test`;

async function request(path, options = {}, expectedStatus = 200) {
    const response = await fetch(`${apiRoot}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    const payload = await response.json();
    if (response.status !== expectedStatus) {
        throw new Error(`${options.method || 'GET'} ${path}: expected ${expectedStatus}, received ${response.status}: ${payload.message}`);
    }
    return payload;
}

function auth(token) {
    return { Authorization: `Bearer ${token}` };
}

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    const temporarySuper = await Admin.create({ username: `${marker}-provisioner`, email: superEmail, password, role: 'super_admin' });

    try {
        const superLogin = await request('/auth/login', {
            method: 'POST', body: JSON.stringify({ email: superEmail, password, userType: 'admin' })
        });
        const superToken = superLogin.data.token;

        await request('/admin/statistics', { headers: auth(superToken) }, 403);
        await request('/admin/administrators', {
            method: 'POST', headers: auth(superToken),
            body: JSON.stringify({ username: `${marker}-admin`, email: adminEmail, password })
        }, 201);

        const adminLogin = await request('/auth/login', {
            method: 'POST', body: JSON.stringify({ email: adminEmail, password, userType: 'admin' })
        });
        const adminToken = adminLogin.data.token;
        await request('/admin/administrators', { headers: auth(adminToken) }, 403);

        const memberRegistration = await request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                prefix: 'Dr.', nameWithInitials: 'C. Test', fullName: 'Codex Workflow Test',
                dateOfBirth: '1990-01-01', nicNumber: `${Date.now()}V`, nationality: 'Sri Lankan',
                gender: 'other', district: 'Colombo', residentialAddress: 'Temporary test address',
                mobileNumber: '0771234567', personalEmail: memberEmail, password
            })
        }, 201);
        const memberToken = memberRegistration.data.token;
        const memberId = memberRegistration.data.member.id;

        const category = await request('/admin/member-categories', {
            method: 'POST', headers: auth(adminToken),
            body: JSON.stringify({ name: `${marker} Category`, description: 'Disposable workflow verification' })
        }, 201);
        await request(`/admin/members/${memberId}/category`, {
            method: 'PATCH', headers: auth(adminToken), body: JSON.stringify({ categoryId: category.data._id })
        });

        const payment = await request('/member/payments', {
            method: 'POST', headers: auth(memberToken),
            body: JSON.stringify({ paymentType: 'annual', paymentYear: new Date().getFullYear(), amount: 2500, paymentMethod: 'bank_transfer', transactionId: marker })
        }, 201);
        if (payment.data.source !== 'member' || payment.data.paymentStatus !== 'pending') throw new Error('Member payment source/status was not recorded correctly.');
        await request(`/admin/payments/${payment.data._id}/verify`, {
            method: 'PATCH', headers: auth(adminToken), body: JSON.stringify({ paymentStatus: 'completed' })
        });

        const update = await request('/member/profile-update-requests', {
            method: 'POST', headers: auth(memberToken),
            body: JSON.stringify({ personalDetails: { mobileNumber: '0717654321', personalEmail: changedEmail } })
        }, 201);
        await request(`/admin/profile-update-requests/${update.data._id}`, {
            method: 'PATCH', headers: auth(adminToken), body: JSON.stringify({ decision: 'approved' })
        });

        const updatedMember = await Member.findById(memberId).lean();
        if (updatedMember.personalDetails.personalEmail !== changedEmail || updatedMember.personalDetails.mobileNumber !== '0717654321') {
            throw new Error('Approved member profile changes were not applied.');
        }

        console.log('Feature workflow verification passed.');
    } finally {
        const members = await Member.find({ 'personalDetails.personalEmail': { $in: [memberEmail, changedEmail] } }).select('_id');
        const memberIds = members.map((member) => member._id);
        await Promise.all([
            Payment.deleteMany({ $or: [{ memberId: { $in: memberIds } }, { transactionId: marker }] }),
            MemberUpdateRequest.deleteMany({ memberId: { $in: memberIds } }),
            Notification.deleteMany({ $or: [{ recipientId: { $in: memberIds } }, { 'metadata.memberId': { $in: memberIds } }] }),
            MemberCategory.deleteMany({ name: `${marker} Category` }),
            Member.deleteMany({ _id: { $in: memberIds } }),
            Admin.deleteMany({ email: { $in: [superEmail, adminEmail] } })
        ]);
        await mongoose.disconnect();
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
