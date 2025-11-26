import { getCompanyXml } from "@/lib/utils";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /tally/api
 * Test Tally connection via backend proxy
 *
 * ⚠️ IMPORTANT: This route is NOT used when deployed on Vercel
 *
 * This API route is included for scenarios where the backend has
 * direct network access to the Tally server, such as:
 * - Local development/testing
 * - Deployment on VPS/dedicated servers in the same network as Tally
 * - Internal company servers with direct Tally access
 *
 * For Vercel deployment, the frontend uses direct client-side connections
 * to Tally (see app/page.tsx). This requires CORS to be enabled in Tally.
 *
 * Why this doesn't work on Vercel:
 * - Vercel serverless functions run in the cloud
 * - They cannot access localhost or private network IPs
 * - Tally servers typically run on local/private networks
 */
export async function POST(request: NextRequest) {
  let host: string = "";
  let port: string = "";

  try {
    const body = await request.json();
    host = body.host;
    port = body.port;

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });

    console.log("data=====>", host, port);

    // Validate required fields
    if (!host || !port) {
      return NextResponse.json(
        {
          success: false,
          message: "Host and port are required",
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const response = await axios.get(`http://${host}:${port}`, {
      headers: {
        "Content-Type": "application/xml",
        Accept: "application/xml",
      },
      timeout: 5000, // 5 second timeout
    });

    const companyXml = getCompanyXml();

    const companyResponse = await axios.post(
      `http://${host}:${port}`,
      companyXml,
      {
        headers: {
          "Content-Type": "application/xml",
          Accept: "application/xml",
        },
        timeout: 5000, // 5 second timeout
      }
    );

    const companyResponseData = await parser.parse(companyResponse.data);

    const activeCompanyName =
      companyResponseData["ENVELOPE"]?.["BODY"]?.["DATA"]?.["COLLECTION"]?.[
        "COMPANY"
      ]?.["NAME"];

    return NextResponse.json(
      {
        success: true,
        data: response.data,
        activeCompanyName,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Tally API Route] Error:", error);

    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      // Connection refused - Tally server not running or wrong port
      if (error.code === "ECONNREFUSED") {
        return NextResponse.json(
          {
            success: false,
            message: "Cannot connect to Tally server",
            error: `Tally Prime is not running at ${host}:${port} or the port is incorrect. Please ensure Tally Prime is running and ODBC Server is enabled.`,
          },
          { status: 503 }
        );
      }

      // Timeout error
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        return NextResponse.json(
          {
            success: false,
            message: "Connection timeout",
            error: `Tally server at ${host}:${port} is not responding. Please check if Tally Prime is running and accessible.`,
          },
          { status: 504 }
        );
      }

      // Network errors
      if (error.code === "ENOTFOUND") {
        return NextResponse.json(
          {
            success: false,
            message: "Host not found",
            error: `Cannot resolve host: ${host}. Please check the IP address or hostname.`,
          },
          { status: 503 }
        );
      }

      // HTTP error responses from Tally
      if (error.response) {
        return NextResponse.json(
          {
            success: false,
            message: "Tally server error",
            error:
              error.response.data ||
              `HTTP ${error.response.status}: ${error.response.statusText}`,
          },
          { status: error.response.status }
        );
      }
    }

    // Generic error fallback
    return NextResponse.json(
      {
        success: false,
        message: "Connection test failed",
        error: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
