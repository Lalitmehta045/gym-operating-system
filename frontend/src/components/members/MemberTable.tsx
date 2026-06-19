"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash, RotateCcw, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { EmptyState, LoadingState } from "@/components/ui/States"
import { Member } from "@/hooks/api/useMembers"
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/ui/Modal"

interface MemberTableProps {
  members: Member[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

export function MemberTable({ members, isLoading, onDelete, onRestore }: MemberTableProps) {
  const router = useRouter()
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
  const [restoreModalOpen, setRestoreModalOpen] = React.useState(false)
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(null)

  const handleAction = (member: Member, action: "view" | "edit" | "delete" | "restore") => {
    switch (action) {
      case "view":
        router.push(`/members/${member.id}`)
        break
      case "edit":
        router.push(`/members/${member.id}/edit`)
        break
      case "delete":
        setSelectedMember(member)
        setDeleteModalOpen(true)
        break
      case "restore":
        setSelectedMember(member)
        setRestoreModalOpen(true)
        break
    }
  }

  const confirmDelete = () => {
    if (selectedMember) {
      onDelete(selectedMember.id)
      setDeleteModalOpen(false)
      setSelectedMember(null)
    }
  }

  const confirmRestore = () => {
    if (selectedMember) {
      onRestore(selectedMember.id)
      setRestoreModalOpen(false)
      setSelectedMember(null)
    }
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (!members?.length) {
    return <EmptyState title="No members found" description="Adjust your filters or add a new member." />
  }

  return (
    <>
      <div className="rounded-[12px] border border-[#ebebeb] bg-[#ffffff] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.memberCode}</TableCell>
                <TableCell>{member.firstName} {member.lastName}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    member.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                    member.status === "SUSPENDED" ? "bg-orange-100 text-orange-700" :
                    member.status === "EXPIRED" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {member.status}
                  </span>
                </TableCell>
                <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="md" onClick={() => handleAction(member, "view")}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="md" onClick={() => handleAction(member, "edit")}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {member.status === "ACTIVE" || member.status === "PENDING" || member.status === "SUSPENDED" || member.status === "EXPIRED" ? (
                      <Button variant="secondary" size="md" onClick={() => handleAction(member, "delete")} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                        <Trash className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {/* Assuming there might be a 'deleted' status flag conceptually if not in enum, or we show restore for certain states if applicable */}
                    {!member.isActive && (
                      <Button variant="secondary" size="md" onClick={() => handleAction(member, "restore")}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Delete Member</ModalTitle>
            <ModalDescription>
              Are you sure you want to delete {selectedMember?.firstName} {selectedMember?.lastName}? This action cannot be undone.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal open={restoreModalOpen} onOpenChange={setRestoreModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Restore Member</ModalTitle>
            <ModalDescription>
              Are you sure you want to restore {selectedMember?.firstName} {selectedMember?.lastName}?
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setRestoreModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={confirmRestore}>
              Restore
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
