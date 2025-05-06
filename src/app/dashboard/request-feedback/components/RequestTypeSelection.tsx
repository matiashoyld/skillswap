'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { FileText, Link as LinkIcon, Mail, Briefcase, FileCheck } from 'lucide-react';

const requestTypes = [
  {
    id: 'resume',
    title: 'Resume',
    description: 'Get feedback on your resume to improve its impact and effectiveness.',
    icon: FileText,
    href: '/dashboard/request-feedback/resume',
  },
  {
    id: 'linkedin',
    title: 'LinkedIn Profile',
    description: 'Receive feedback on your LinkedIn profile to enhance your professional presence.',
    icon: LinkIcon,
    href: '/dashboard/request-feedback/linkedin',
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    description: 'Get constructive feedback on your portfolio to showcase your work better.',
    icon: Briefcase,
    href: '/dashboard/request-feedback/portfolio',
  },
  {
    id: 'coverletter',
    title: 'Cover Letter',
    description: 'Receive feedback on your cover letter to make it more compelling.',
    icon: FileCheck,
    href: '/dashboard/request-feedback/coverletter',
  },
  {
    id: 'email',
    title: 'Cold Email',
    description: 'Get feedback on your cold emails to improve response rates.',
    icon: Mail,
    href: '/dashboard/request-feedback/email',
  },
];

export const RequestTypeSelection = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle>What would you like feedback on?</CardTitle>
          <CardDescription>Select the type of content you want to get feedback for.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {requestTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.id} className="w-full max-w-[380px]">
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto py-8 px-6 flex flex-col items-start justify-start space-y-2 text-left"
                  >
                    <Link href={type.href}>
                      <Icon className="h-6 w-6 text-brand-primary" />
                      <span className="font-semibold block mb-1">{type.title}</span>
                        <p className="text-sm text-gray-500 break-words whitespace-pre-wrap">{type.description}</p>
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 