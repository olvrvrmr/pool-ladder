'use client'

import { useState } from 'react'
import { User } from '@prisma/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type AddMatchScoreProps = {
  currentUserId: string
  players: User[]
  isAdmin: boolean
  onAddScore: (winnerId: string, loserId: string, winnerScore: number, loserScore: number) => Promise<void>
}

export default function AddMatchScore({ currentUserId, players, isAdmin, onAddScore }: AddMatchScoreProps) {
  const { toast } = useToast()
  const [winnerId, setWinnerId] = useState(currentUserId)
  const [loserId, setLoserId] = useState('')
  const [winnerScore, setWinnerScore] = useState('')
  const [loserScore, setLoserScore] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!winnerId || !loserId || !winnerScore || !loserScore) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (parseInt(winnerScore) <= parseInt(loserScore)) {
      toast({
        title: "Error",
        description: "Winner's score must be higher than loser's score",
        variant: "destructive",
      })
      return
    }

    try {
      await onAddScore(winnerId, loserId, parseInt(winnerScore), parseInt(loserScore))
      toast({
        title: "Success",
        description: "Match score added successfully",
      })
      setLoserId('')
      setWinnerScore('')
      setLoserScore('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add match score",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="winner" className="block text-sm font-medium text-gray-700">
          Winner
        </label>
        <Select
          value={winnerId}
          onValueChange={setWinnerId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select winner" />
          </SelectTrigger>
          <SelectContent>
            {isAdmin ? (
              players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value={currentUserId}>
                {players.find(p => p.id === currentUserId)?.name || 'You'}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor="loser" className="block text-sm font-medium text-gray-700">
          Loser
        </label>
        <Select
          value={loserId}
          onValueChange={setLoserId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select loser" />
          </SelectTrigger>
          <SelectContent>
            {players.filter(player => player.id !== winnerId).map((player) => (
              <SelectItem key={player.id} value={player.id}>
                {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor="winnerScore" className="block text-sm font-medium text-gray-700">
          Winner Score
        </label>
        <Input
          type="number"
          id="winnerScore"
          value={winnerScore}
          onChange={(e) => setWinnerScore(e.target.value)}
          min="0"
          required
        />
      </div>
      <div>
        <label htmlFor="loserScore" className="block text-sm font-medium text-gray-700">
          Loser Score
        </label>
        <Input
          type="number"
          id="loserScore"
          value={loserScore}
          onChange={(e) => setLoserScore(e.target.value)}
          min="0"
          required
        />
      </div>
      <Button type="submit">Add Match Score</Button>
    </form>
  )
}

