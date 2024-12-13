'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User } from '@prisma/client'

type ChallengeFormProps = {
  players: User[]
  onChallenge: (challengerId: string, challengedId: string, matchDate: string) => void
}

export default function ChallengeForm({ players, onChallenge }: ChallengeFormProps) {
  const [challengerId, setChallengerId] = useState('')
  const [challengedId, setChallengedId] = useState('')
  const [matchDate, setMatchDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (challengerId && challengedId && matchDate) {
      onChallenge(challengerId, challengedId, matchDate)
      setChallengerId('')
      setChallengedId('')
      setMatchDate('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="challenger" className="block text-sm font-medium text-gray-700">
          Challenger
        </label>
        <Select
          value={challengerId}
          onValueChange={setChallengerId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a player" />
          </SelectTrigger>
          <SelectContent>
            {players.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor="challenged" className="block text-sm font-medium text-gray-700">
          Challenged
        </label>
        <Select
          value={challengedId}
          onValueChange={setChallengedId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a player" />
          </SelectTrigger>
          <SelectContent>
            {players.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor="matchDate" className="block text-sm font-medium text-gray-700">
          Match Date
        </label>
        <Input
          type="datetime-local"
          id="matchDate"
          value={matchDate}
          onChange={(e) => setMatchDate(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Create Challenge</Button>
    </form>
  )
}

