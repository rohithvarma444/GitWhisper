import React from 'react'
import useProjects from '@/hooks/use-projects'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner';
import { User } from 'lucide-react';
function Invite() {

    const {projectId}   = useProjects();
    const [open, setOpen] = React.useState(false);

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
        </DialogHeader>
        <p>Join your team members using this link</p>
        <input type="text"
        value={`${window.location.origin}/join/${projectId}`} 
        onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/join/${projectId}`);
            toast.success("Link copied to clipboard");
        }}
        className="w-full border rounded-md p-4 mt-2"
        />
      </DialogContent>
    </Dialog>
    <Button variant="outline" onClick={() => setOpen(true)} className="px-3 py-1 bg-gray-200 text-black rounded hover:bg-gray-300">
        <User/>
        Invite
    </Button>
    </>
  )
}

export default Invite