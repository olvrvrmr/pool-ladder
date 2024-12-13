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

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Challenger
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Challenged
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {challenges?.map((challenge) => (
            <tr key={challenge.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {challenge.challenger.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {challenge.challenged.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {challenge.status}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

