export const currentUser = {
  id: "me",
  name: "Aravinth",
};

export const chats = [
  {
    id: "1",
    name: "Alex",
    initials: "A",
    status: "Online",
    lastMessage: "Are we still meeting today?",
    time: "10:42 AM",
    unread: 2,
  },
  {
    id: "2",
    name: "Sarah",
    initials: "S",
    status: "Away",
    lastMessage: "That sounds good!",
    time: "9:18 AM",
    unread: 0,
  },
  {
    id: "3",
    name: "Michael",
    initials: "M",
    status: "Offline",
    lastMessage: "Thanks for sending that.",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: "4",
    name: "Emma",
    initials: "E",
    status: "Online",
    lastMessage: "See you soon.",
    time: "Yesterday",
    unread: 4,
  },
];

export const messages = [
  {
    id: "m1",
    senderId: "2",
    text: "Hey! Are we still meeting today?",
    time: "10:38 AM",
    mine: false,
  },
  {
    id: "m2",
    senderId: "me",
    text: "Yeah, definitely.",
    time: "10:39 AM",
    mine: true,
  },
  {
    id: "m3",
    senderId: "2",
    text: "Perfect. What time works for you?",
    time: "10:40 AM",
    mine: false,
  },
  {
    id: "m4",
    senderId: "me",
    text: "Around 6 should work.",
    time: "10:41 AM",
    mine: true,
  },
  {
    id: "m5",
    senderId: "2",
    text: "Awesome. See you then!",
    time: "10:42 AM",
    mine: false,
  },
];