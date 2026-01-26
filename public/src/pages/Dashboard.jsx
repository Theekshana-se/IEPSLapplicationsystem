import { useState } from "react";
import Toast from "../components/Toast";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import MembershipForm from "../components/MembershipForm";
import MembershipFormStep2 from "../components/MembershipFormStep2";
import MembershipFormStep3 from "../components/MembershipFormStep3";
import MembershipFormStep4 from "../components/MembershipFormStep4";
import MembershipFormStep5 from "../components/MembershipFormStep5";
import MembershipFormStep6 from "../components/MembershipFormStep6";

const Dashboard = () => {
  const [step, setStep] = useState(1);
  const [showToast, setShowToast] = useState(false);

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-body">
        <Sidebar />

        {step === 1 && (
          <MembershipForm onNext={() => setStep(2)} />
        )}

        {step === 2 && (
          <MembershipFormStep2
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <MembershipFormStep3
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <MembershipFormStep4
            onBack={() => setStep(3)}
            onNext={() => setStep(5)}
          />
        )}

        {step === 5 && (
          <MembershipFormStep5
            onBack={() => setStep(4)}
            onNext={() => setStep(6)}
          />
        )}

        {step === 6 && (
          <MembershipFormStep6
            onBack={() => setStep(5)}
            onSubmit={() => setShowToast(true)}
          />
        )}
      </div>
      {showToast && (
        <Toast
          message="Form Submitted Successfully"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
