import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const HelpPage: React.FC = () => {
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);

  // Check for URL parameter to open specific accordion
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accordionId = urlParams.get('open');
    if (accordionId) {
      setOpenAccordion(accordionId);
    }
  }, []);

  const faqs = [
    {
      id: 'how-clearing-works',
      question: 'How does Clearing work?',
      answer: 'Local Loop clearing matches invoices between members to reduce the total amount of money that needs to flow. When you have invoices to send and receive with other members, we can "clear" matching amounts, leaving only the net difference to be paid.'
    },
    {
      id: 'what-is-loop',
      question: 'What is a loop?',
      answer: 'TBD - Exact wording coming soon'
    },
    {
      id: 'why-some-invoices',
      question: 'Why do only some invoices appear in Clearing?',
      answer: 'Only invoices between Local Loop members can be cleared. Invoices with non-members are automatically excluded by the system. You can also manually exclude invoices if you prefer to pay them directly.'
    },
    {
      id: 'after-clearing',
      question: 'What happens after clearing?',
      answer: 'After clearing completes, you\'ll receive a results sheet showing exactly which invoices were cleared and any remaining amounts to pay or receive. Cleared invoices are considered legally settled between the parties.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Help</h1>
      
      {/* FAQs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion 
            type="single" 
            collapsible 
            className="w-full"
            value={openAccordion}
            onValueChange={setOpenAccordion}
          >
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Example Results Sheet */}
      <Card>
        <CardHeader>
          <CardTitle>Example: Clearing Results Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg border">
            <div className="text-sm text-muted-foreground mb-2">Sample clearing outcome:</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Invoices submitted for clearing:</span>
                <span className="font-medium">8 invoices (£45,000)</span>
              </div>
              <div className="flex justify-between">
                <span>Invoices successfully cleared:</span>
                <span className="font-medium">6 invoices (£32,000)</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining to pay/receive:</span>
                <span className="font-medium">£13,000</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPage;