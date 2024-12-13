'use client'

import { useState } from 'react'
import { Challenge, User } from '@prisma/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type ChallengeWithUsers = Challenge & {
  challenger: User
  challenged: User
}

type ChallengeManagementProps = {
  challenges?: ChallengeWithUsers[]
  onUpdateStatus: (challengeId: string, newStatus: string) => Promise<void>
}

export default function ChallengeManagement({ challenges = [], onUpdateStatus }: ChallengeManagementProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleStatusChange = async (challengeId: string, newStatus: string) => {
    setUpdatingId(challengeId)
    try {
      await onUpdateStatus(challengeId, newStatus)
    } catch (error) {
      console.error('Failed to update challenge status:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>
      case 'ACCEPTED':
        return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
      case 'COMPLETED':
        return <Badge variant="secondary" className="bg-green-500 hover:bg-green-600">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Challenger</TableHead>
            <TableHead>Challenged</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {challenges.map((challenge) => (
            <TableRow key={challenge.id}>
              <TableCell>{challenge.challenger.name}</TableCell>
              <TableCell>{challenge.challenged.name}</TableCell>
              <TableCell>{getStatusBadge(challenge.status)}</TableCell>
              <TableCell>
                <Select
                  defaultValue={challenge.status}
                  onValueChange={(value) => handleStatusChange(challenge.id, value)}
                  disabled={updatingId === challenge.id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

