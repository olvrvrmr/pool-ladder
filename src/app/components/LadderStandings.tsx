'use client'

import { User } from '@prisma/client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

type LadderStandingsProps = {
  players: User[]
  isAdmin: boolean
  currentUserId?: string
  currentUserRank?: number
  maxRankDifference?: number
  onChallenge?: (formData: FormData) => Promise<void>
  userHasActiveChallenge: boolean
  onDeletePlayer?: (playerId: string) => Promise<void>
  isHomepage?: boolean
}

export default function LadderStandings({ 
  players: initialPlayers, 
  isAdmin, 
  currentUserId, 
  currentUserRank,
  maxRankDifference,
  onChallenge,
  userHasActiveChallenge,
  onDeletePlayer,
  isHomepage = false
}: LadderStandingsProps) {
  const [players, setPlayers] = useState(initialPlayers)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRank, setEditRank] = useState<number | null>(null)
  const { toast } = useToast()

  const handleEdit = (player: User) => {
    setEditingId(player.id)
    setEditRank(player.rank)
  }

  const handleSave = async (player: User) => {
    if (editRank === null) return

    try {
      const response = await fetch(`/api/players/${player.id}/rank`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rank: editRank }),
      })

      if (response.ok) {
        const updatedPlayer = await response.json()
        setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p))
        setEditingId(null)
        setEditRank(null)
        toast({
          title: "Success",
          description: "Player rank updated successfully",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update player rank')
      }
    } catch (error) {
      console.error('Error updating player rank:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while updating player rank",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditRank(null)
  }

  const handleDelete = async (playerId: string) => {
    if (onDeletePlayer) {
      try {
        await onDeletePlayer(playerId)
        setPlayers(players.filter(p => p.id !== playerId))
        toast({
          title: "Success",
          description: "Player deleted successfully",
        })
      } catch (error) {
        console.error('Error deleting player:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred while deleting the player",
          variant: "destructive",
        })
      }
    }
  }

  const canChallenge = (playerRank: number) => {
    if (currentUserRank === undefined || maxRankDifference === undefined) {
      return false
    }
    const rankDifference = Math.abs(currentUserRank - playerRank)
    return rankDifference <= maxRankDifference
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            {!isHomepage && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {players.map((player) => (
            <tr key={player.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {editingId === player.id ? (
                  <Input
                    type="number"
                    value={editRank ?? ''}
                    onChange={(e) => setEditRank(parseInt(e.target.value))}
                    className="w-20"
                  />
                ) : (
                  player.rank
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{player.name}</div>
              </td>
              {!isHomepage && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {isAdmin && editingId === player.id ? (
                    <>
                      <Button onClick={() => handleSave(player)} className="mr-2">Save</Button>
                      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    </>
                  ) : isAdmin ? (
                    <>
                      <Button onClick={() => handleEdit(player)} className="mr-2">Edit</Button>
                      <Button onClick={() => handleDelete(player.id)} variant="destructive">Delete</Button>
                    </>
                  ) : currentUserId && currentUserId !== player.id && onChallenge && canChallenge(player.rank) ? (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      onChallenge(formData);
                    }}>
                      <input type="hidden" name="challengedId" value={player.id} />
                      <Button 
                        type="submit"
                        disabled={userHasActiveChallenge}
                      >
                        {userHasActiveChallenge ? 'Challenge Pending' : 'Challenge'}
                      </Button>
                    </form>
                  ) : null}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

