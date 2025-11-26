"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { splitHostAndPort } from "@/lib/utils";
import axios from "axios";
import { Loader2, PlayCircle, Wifi, WifiOff } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [tallyUrl, setTallyUrl] = useState("");
  const [tallyPort, setTallyPort] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setErrorMessage("");

    let currentUrl = `${tallyUrl}:${tallyPort}`;

    if (
      !currentUrl.startsWith("http://") &&
      !currentUrl.startsWith("https://")
    ) {
      currentUrl = `http://${currentUrl}`;
    }
    try {
      const { host, port } = splitHostAndPort(currentUrl);
      const response = await axios.post("/tally/api", {
        host,
        port,
        companyName,
      });

      console.log(response.data);
      setIsConnected(true);
      setErrorMessage("");
    } catch (error: any) {
      setIsConnected(false);

      // Extract error message from API response
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to connect to Tally server";
      setErrorMessage(errorMsg);
      console.error("Connection error:", error);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {" "}
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-muted-foreground" />
          )}
          Connection Settings
        </CardTitle>
        <CardDescription>
          Configure your Tally Prime connection details
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isConnected && (
          <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 p-4">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Connected to Tally</span>
            </div>
            {companyName && (
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                Company Name: {companyName}
              </div>
            )}
          </div>
        )}

        {errorMessage && !isConnected && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
            <div className="flex items-start gap-2 text-red-800 dark:text-red-200">
              <WifiOff className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-medium block">Connection Failed</span>
                <span className="text-sm mt-1 block">{errorMessage}</span>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tallyUrl">Tally IP</Label>
            <Input
              id="tallyUrl"
              placeholder="localhost"
              value={tallyUrl}
              onChange={(e) => setTallyUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              The URL where Tally Prime is running (default: localhost)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tallyPort">Tally Port</Label>
            <Input
              id="tallyPort"
              placeholder="9000"
              value={tallyPort}
              onChange={(e) => setTallyPort(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              The port where Tally Prime is running (default: 9000)
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            placeholder="Enter your Tally company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Exact company name as it appears in Tally Prime
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="enabled">Enable Tally Integration</Label>
            <p className="text-sm text-muted-foreground">
              Turn on Tally integration for this organization
            </p>
          </div>
          <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleTestConnection}
            disabled={testingConnection || !tallyUrl || !companyName}
            variant="outline"
          >
            {testingConnection ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
