import json
import sys

import pandas as pd


def json_default(value):
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def main():
    if len(sys.argv) < 2:
        raise SystemExit("Usage: readLegacyMembersWorkbook.py <xlsx_path> [sheet_name]")

    workbook_path = sys.argv[1]
    sheet_name = sys.argv[2] if len(sys.argv) > 2 else "Full Information"

    dataframe = pd.read_excel(workbook_path, sheet_name=sheet_name)
    dataframe = dataframe.astype(object).where(pd.notna(dataframe), None)

    records = dataframe.to_dict(orient="records")
    json.dump(records, sys.stdout, ensure_ascii=False, default=json_default, allow_nan=False)


if __name__ == "__main__":
    main()
