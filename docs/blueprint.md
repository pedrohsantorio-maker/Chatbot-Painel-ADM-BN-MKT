# **App Name**: GiChat

## Core Features:

- Age Gate: Implement an age verification screen with 'Yes' and 'No' options, blurring the content underneath. Redirect users over 18 to the chat and display a restricted access message to those under 18.
- WhatsApp-Style Chat Interface: Create a chat interface mimicking WhatsApp, with user and bot message bubbles, typing indicators, audio recording and playback, and media previews.
- Interactive Message Flow: Implement a step-by-step interactive conversation flow where the bot waits for user actions (e.g., button clicks) before sending the next message.
- Realistic Delays: Introduce realistic delays (typing indicators) before the bot sends messages to simulate a human-like interaction.
- User Data Capture: Capture user's name and email at the start of the conversation, validating the email format and storing the data in Firestore.
- Media Handling: Allow users to send audio, images, and videos, storing them in Firebase Storage and displaying previews in the chat interface. Use Firebase Functions to process the uploads and register the message type.
- Payment Redirection: After capturing user information and permission, generate a payment link using a Firebase Function and send it as a message type link. Register events for tracking purposes.

## Style Guidelines:

- Primary color: Deep pink (#D81B60) to create a modern, playful vibe. The color relates back to the pink button as requested.
- Background color: Light pink (#FCE4EC), visibly in the same hue, but highly desaturated for a clean and soft base.
- Accent color: Violet (#8E24AA), analogous to deep pink, adding a dynamic and contrasting element to highlights.
- Body and headline font: 'Poppins' (sans-serif) for a modern, geometric, and fashionable feel. Great for small to medium length texts and the primary branding of the App.
- WhatsApp-like layout with message bubbles on the right for the user and on the left for the bot, complemented by subtle animations.
- Use slide and fade-in animations for new messages and implement a GIF or loader as a typing indicator for realistic delays.
- Use recognizable chat icons similar to WhatsApp's design for actions like sending messages, recording audio, and attaching media.