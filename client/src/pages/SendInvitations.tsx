import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Input } from '../components/UI';
import { Upload, Mail, CheckCircle, AlertCircle, ArrowLeft, X, Paperclip, FileText, Loader2, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function SendInvitations() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [emails, setEmails] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<{ filename: string, path: string }[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const processEmails = (text: string) => {
    // Split by comma, newline, or semicolon and filter valid emails
    const emailList = text
      .split(/[,\n;]/)
      .map(e => e.trim())
      .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    
    setEmails(prev => Array.from(new Set([...prev, ...emailList])));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processEmails(text);
    };
    reader.readAsText(file);
    // Reset input so the same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus(null);

    try {
      const storageRef = ref(storage, `attachments/${id}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setAttachments(prev => [...prev, { filename: file.name, path: downloadURL }]);
    } catch (err) {
      console.error('Error uploading file:', err);
      setStatus({ type: 'error', message: 'Failed to upload attachment.' });
    } finally {
      setIsUploading(false);
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processEmails(text);
      };
      reader.readAsText(file);
    }
  };

  const addManualEmail = () => {
    if (manualEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualEmail)) {
      setEmails(prev => Array.from(new Set([...prev, manualEmail])));
      setManualEmail('');
    }
  };

  const removeEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email));
  };

  const handleSend = async () => {
    if (emails.length === 0) return;
    
    setIsSending(true);
    setStatus(null);

    try {
      const response = await fetch('/api/surveys/send-invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          surveyId: id,
          emails: emails,
          surveyUrl: `${window.location.origin}/survey/${id}`,
          attachments: attachments
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: `Successfully sent ${emails.length} invitations!` });
        setEmails([]);
        setAttachments([]);
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send invitations.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An error occurred while sending invitations.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/dashboard" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Upload size={20} className="text-indigo-600" />
              Upload Participant Emails
            </h2>
            <p className="text-neutral-600 text-sm mb-6">
              Upload a .csv or .txt file containing email addresses, or paste them below.
            </p>

            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all group ${
                isDragging 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-neutral-200 hover:border-indigo-400 hover:bg-indigo-50/30'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv,.txt" 
                className="hidden" 
              />
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
                isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-neutral-100 group-hover:bg-indigo-100 group-hover:text-indigo-600'
              }`}>
                <Upload size={24} />
              </div>
              <p className="font-medium text-neutral-900">
                {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-neutral-500 mt-1">CSV or TXT files only</p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Add emails manually</label>
              <div className="flex gap-2 items-center">
                <Input 
                  placeholder="email@example.com" 
                  value={manualEmail}
                  className="flex-1"
                  onChange={(e) => setManualEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addManualEmail();
                    }
                  }}
                />
                <Button 
                  variant="primary" 
                  onClick={addManualEmail}
                  className="whitespace-nowrap shrink-0"
                  disabled={!manualEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualEmail)}
                >
                  Add Email
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Paperclip size={20} className="text-indigo-600" />
                Attachments
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex gap-2"
                onClick={() => attachmentInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Attach File
              </Button>
              <input 
                type="file" 
                ref={attachmentInputRef} 
                onChange={handleFileAttachment} 
                className="hidden" 
              />
            </div>

            {attachments.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 border border-dashed border-neutral-100 rounded-lg text-sm">
                No files attached.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={16} className="text-neutral-400 shrink-0" />
                      <span className="text-sm text-neutral-700 truncate">{file.filename}</span>
                    </div>
                    <button 
                      onClick={() => removeAttachment(idx)}
                      className="text-neutral-400 hover:text-red-600 transition-colors ml-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Mail size={20} className="text-indigo-600" />
                Recipient List ({emails.length})
              </h2>
              {emails.length > 0 && (
                <button 
                  onClick={() => setEmails([])}
                  className="text-sm text-red-600 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {emails.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 border border-dashed border-neutral-100 rounded-lg">
                No recipients added yet.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {emails.map((email) => (
                  <div key={email} className="flex items-center justify-between bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                    <span className="text-sm text-neutral-700">{email}</span>
                    <button 
                      onClick={() => removeEmail(email)}
                      className="text-neutral-400 hover:text-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Send Invitations</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Survey Link</label>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs font-mono break-all text-neutral-600">
                  {window.location.origin}/survey/{id}
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSend}
                  disabled={emails.length === 0 || isSending}
                  className="w-full flex items-center justify-center gap-2 py-6"
                >
                  {isSending ? (
                    'Sending...'
                  ) : (
                    <>
                      <Mail size={18} />
                      Send to {emails.length} People
                    </>
                  )}
                </Button>
              </div>

              {status && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}
                >
                  {status.type === 'success' ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
                  <p className="text-sm">{status.message}</p>
                </motion.div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
