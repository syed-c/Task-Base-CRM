"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { File, FileText, Image, Download, X } from "lucide-react";
import { toast } from "sonner";

export interface DisplayFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

interface FileDisplayProps {
  files: DisplayFile[];
  onRemoveFile?: (fileId: string) => void;
  showRemoveButton?: boolean;
  maxDisplay?: number;
}

export function FileDisplay({
  files,
  onRemoveFile,
  showRemoveButton = false,
  maxDisplay = 5,
}: FileDisplayProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-4 text-black/60">
        <File className="h-8 w-8 mx-auto mb-2 text-black/30" />
        <p className="text-sm">No files uploaded</p>
      </div>
    );
  }

  const displayFiles = files.slice(0, maxDisplay);
  const hasMore = files.length > maxDisplay;

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (type === "application/pdf") return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = (file: DisplayFile) => {
    try {
      window.open(file.url, "_blank");
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const handleRemove = (fileId: string) => {
    if (onRemoveFile) {
      onRemoveFile(fileId);
      toast.success("File removed");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-black">
          Attached Files ({files.length})
        </h4>
        {hasMore && (
          <Badge
            variant="outline"
            className="text-xs border-brand-coffee/30 text-brand-coffee"
          >
            +{files.length - maxDisplay} more
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {displayFiles.map((file) => (
          <Card
            key={file.id}
            className="bg-brand-offwhite border border-brand-coffee/10 hover:shadow-sm transition-shadow"
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="text-brand-coffee">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-black/60">
                        {formatFileSize(file.size)}
                      </p>
                      <span className="text-black/30">•</span>
                      <p className="text-xs text-black/60">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(file)}
                    className="text-brand-coffee hover:bg-brand-coffee/10"
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {showRemoveButton && onRemoveFile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(file.id)}
                      className="text-red-500 hover:bg-red-50"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
