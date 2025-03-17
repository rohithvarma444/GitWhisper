import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import useProjects from "@/hooks/use-projects";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { set } from "date-fns";

const AskQuestion = () => {
  const { project } = useProjects(); 
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);


  const handleSubmit = () => {
    setOpen(true);
  };

  return (

    <>
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex justify-center">
                <h2>GitRAG</h2>
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    <Card className="p-4 shadow-md max-w-md w-full">
      <CardHeader>
        <CardTitle>Ask a Question</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-2">Have any questions about your project?</p>
        <Input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder=" Where is login handled?"
          className="w-full mb-4"
        />
        <Button className="w-full" onClick={handleSubmit}>
          Submit
        </Button>
      </CardContent>
    </Card>
    </>
  );
  
};

export default AskQuestion;