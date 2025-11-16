
import { faker } from '@faker-js/faker'

export type ChatMessage = {
  id: string
  author: string
  message: string
}

const createRandomMessage = (): ChatMessage => {
  return {
    id: faker.string.uuid(),
    author: faker.person.firstName(),
    // Generate a message of random length (1 to 15 sentences)
    message: faker.lorem.sentences({ min: 1, max: 15 }),
  }
}

// Create a massive list of 10,000 messages
export const allMessages = Array.from({ length: 10_000 }, createRandomMessage)