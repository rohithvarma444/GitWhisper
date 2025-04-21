import React from 'react'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import useProjects from '@/hooks/use-projects'
import { api } from '@/trpc/react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

function TeamMembers() {
  const [open, setOpen] = React.useState(false)
  const { projectId } = useProjects()
  const { data: teamMembers } = api.project.getTeamMembers.useQuery({
    projectId
  })


  console.log(teamMembers);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Team Members
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
            {teamMembers?.map((member: any) => (
              <div
                key={member.userId}
                className="flex items-center justify-between border p-3 rounded-md shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.user.imageUrl} alt={member.user.email} />
                    <AvatarFallback>
                      {member.user.firstName?.[0]}
                      {member.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.user.firstName} {member.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {teamMembers?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                No team members yet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        className="px-3 py-1 bg-gray-200 text-black rounded hover:bg-gray-300 flex items-center gap-2"
      >
        <Users className="h-4 w-4" />
        Team Members
      </Button>
    </>
  )
}

export default TeamMembers