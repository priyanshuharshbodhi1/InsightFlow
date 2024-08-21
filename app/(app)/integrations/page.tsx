import { Button } from "@/components/ui/button";
import { Globe, Link, Link2Off, QrCode } from "lucide-react";

export default function Dashboard() {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-xl">Integrations</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="w-full bg-white border rounded-lg p-4 md:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="size-10 bg-brand/10 text-brand rounded-md flex items-center justify-center">
                        <Globe className="size-5" />
                    </div>
                    <h5 className="font-bold">Website</h5>
                </div>
                <p className="text-xs text-gray-500 mb-4">Embed feedback widgets with your websites easily</p>
                <Button variant="dark" size="sm">Connect</Button>
            </div>
            <div className="w-full bg-white border rounded-lg p-4 md:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="size-10 bg-brand/10 text-brand rounded-md flex items-center justify-center">
                        <Link className="size-5" />
                    </div>
                    <h5 className="font-bold">Quick Link</h5>
                </div>
                <p className="text-xs text-gray-500 mb-4">Share a quick link to interact directly with the widgets</p>
                <Button variant="dark" size="sm">Connect</Button>
            </div>
            <div className="w-full bg-white border rounded-lg p-4 md:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="size-10 bg-brand/10 text-brand rounded-md flex items-center justify-center">
                        <QrCode className="size-5" />
                    </div>
                    <h5 className="font-bold">QR Code</h5>
                </div>
                <p className="text-xs text-gray-500 mb-4">Download & Share QR code to interact directly</p>
                <Button variant="dark" size="sm">Connect</Button>
            </div>
        </div>
    </>
  );
}
