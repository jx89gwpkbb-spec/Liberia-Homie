'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { Document } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Trash2, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';

export default function MyDocumentsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'ID Proof' | 'Rental Agreement' | 'Receipt' | 'Other'>('Other');
  const [isUploading, setIsUploading] = useState(false);

  const documentsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/documents`);
  }, [user, firestore]);

  const { data: documents, isLoading: areDocumentsLoading } = useCollection<Document>(documentsQuery);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !firestore) {
      toast({ title: "Missing Information", description: "Please select a file and document type.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const storage = getStorage();
      // Generate a new document ID client-side for the file path
      const documentId = doc(collection(firestore, 'a')).id; 
      const filePath = `documents/${user.uid}/${documentId}/${file.name}`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);
      
      // Use the same ID to create the Firestore document
      const docRef = doc(firestore, `users/${user.uid}/documents`, documentId);
      const newDocument = {
        userId: user.uid,
        fileName: file.name,
        fileUrl: fileUrl,
        documentType: documentType,
        uploadedAt: serverTimestamp(),
      };
      
      await setDoc(docRef, newDocument, { merge: false });

      toast({ title: "Upload Successful", description: "Your document has been uploaded." });
      setFile(null);
      setDocumentType('Other');

    } catch (error) {
      console.error("Upload failed:", error);
      toast({ title: "Upload Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (documentId: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `users/${user.uid}/documents`, documentId);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Document Deleted", description: "The document has been removed." });
  };
  
  const isLoading = isUserLoading || areDocumentsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Documents</h1>
        <p className="text-muted-foreground">Manage your uploaded documents.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Document</CardTitle>
          <CardDescription>Upload rental agreements, ID proofs, or other verification documents.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="file-upload">File</Label>
            <Input id="file-upload" type="file" onChange={handleFileChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-type">Document Type</Label>
            <Select value={documentType} onValueChange={(value) => setDocumentType(value as any)}>
              <SelectTrigger id="doc-type">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ID Proof">ID Proof</SelectItem>
                <SelectItem value="Rental Agreement">Rental Agreement</SelectItem>
                <SelectItem value="Receipt">Receipt</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleUpload} disabled={isUploading || !file} className="w-full">
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload Document
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>A list of all your uploaded documents.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                       <FileText className="h-4 w-4 text-muted-foreground" />
                       {doc.fileName}
                    </TableCell>
                    <TableCell>{doc.documentType}</TableCell>
                    <TableCell>{doc.uploadedAt ? format(doc.uploadedAt.toDate(), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                          <Button asChild variant="outline" size="sm" className="mr-2">
                             <Link href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4"/>
                                View
                             </Link>
                          </Button>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon-sm">
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your document.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(doc.id!)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                       </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    You have not uploaded any documents yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
