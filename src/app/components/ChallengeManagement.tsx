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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

type ChallengeWithUsers = Challenge & {
  challenger: User
  challenged: User
}

type ChallengeManagementProps = {
  challenges: ChallengeWithUsers[]
  onUpdateStatus: (challengeId: string, newStatus: string) => Promise<void>
  onSubmitScore: (challengeId: string, challengerScore: number, challengedScore: number) => Promise<void>
  onUpdateMatchDate: (challengeId: string, newDate: string | null) => Promise<void>
}

export default function ChallengeManagement({ challenges, onUpdateStatus, onSubmitScore, onUpdateMatchDate }: ChallengeManagementProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [challengerScore, setChallengerScore] = useState<string>('')
  const [challengedScore, setChallengedScore] = useState<string>('')
  const [matchDate, setMatchDate] = useState<string>('')
  const { toast } = useToast()

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

  const handleScoreSubmit = async (challengeId: string) => {
    if (!challengerScore || !challengedScore) {
      toast({
        title: "Error",
        description: "Both scores must be provided",
        variant: "destructive",
      })
      return
    }

    const challenger = parseInt(challengerScore)
    const challenged = parseInt(challengedScore)

    if (isNaN(challenger) || isNaN(challenged)) {
      toast({
        title: "Error",
        description: "Scores must be valid numbers",
        variant: "destructive",
      })
      return
    }

    try {
      await onSubmitScore(challengeId, challenger, challenged)
      setChallengerScore('')
      setChallengedScore('')
      toast({
        title: "Success",
        description: "Scores submitted successfully",
      })
    } catch (error) {
      console.error('Failed to submit scores:', error)
      toast({
        title: "Error",
        description: "Failed to submit scores",
        variant: "destructive",
      })
    }
  }

  const handleDateChange = async (challengeId: string, newDate: string) => {
    try {
      const formattedDate = newDate ? new Date(newDate).toISOString() : null;
      await onUpdateMatchDate(challengeId, formattedDate);
      toast({
        title: "Success",
        description: "Match date updated successfully",
      });
    } catch (error) {
      console.error('Failed to update match date:', error);
      toast({
        title: "Error",
        description: "Failed to update match date",
        variant: "destructive",
      });
    }
  };

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
            <TableHead>Match Date</TableHead>
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
                <Input
                  type="datetime-local"
                  value={challenge.matchDate ? new Date(challenge.matchDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleDateChange(challenge.id, e.target.value)}
                  className="w-full"
                />
              </TableCell>
              <TableCell>
                {challenge.status === 'PENDING' && (
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
                )}
                {challenge.status === 'ACCEPTED' && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Challenger Score"
                      value={challengerScore}
                      onChange={(e) => setChallengerScore(e.target.value)}
                      className="w-24"
                    />
                    <Input
                      type="number"
                      placeholder="Challenged Score"
                      value={challengedScore}
                      onChange={(e) => setChallengedScore(e.target.value)}
                      className="w-24"
                    />
                    <Button onClick={() => handleScoreSubmit(challenge.id)}>Submit</Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

