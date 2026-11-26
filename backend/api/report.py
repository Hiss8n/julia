import os
import re
from datetime import datetime, timezone
import gspread
from mcp.server.fastmcp import FastMCP


SHEET_ID = os.environ.get("SHEET_ID", "PUT_YOUR_SHEET_ID_HERE")
CREDS_FILE = os.environ.get("GOOGLE_CREDS", "service_account.json")

mcp = FastMCP("report-sheet")

print("***MCP Server is listenning too***")


if __name__ == "__main__":
    mcp.run()
