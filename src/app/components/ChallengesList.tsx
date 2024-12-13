import { Challenge, User } from '@prisma/client'
import { Badge } from "@/components/ui/badge"

type ChallengesListProps = {
  challenges: (Challenge & {
    challenger: User
    challenged: User
  })[]
}

export default function ChallengesList({ challenges }: ChallengesListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-600">{status}</Badge>
      case 'ACCEPTED':
        return <Badge variant="secondary" className="bg-purple-500 hover:bg-purple-600">{status}</Badge>
      case 'COMPLETED':
        return <Badge variant="secondary" className="bg-green-500 hover:bg-green-600">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {challenges.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {challenges.map((challenge) => (
            <li key={challenge.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{challenge.challenger.name}</span>
                  <span className="mx-2 text-gray-500">VS</span>
                  <span className="font-medium">{challenge.challenged.name}</span>
                </div>
                {getStatusBadge(challenge.status)}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="p-4 text-gray-500">No challenges</p>
      )}
    </div>
  )
}

