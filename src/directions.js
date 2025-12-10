// src/directions.js
const directions = {
  library: {
    einstein: [
      "Exit Library and walk straight for 20 meters.",
      "Turn right at the main corridor.",
      "Einstein Block will be on your left."
    ],
    newton: [
      "Walk straight from Library.",
      "Turn left near the canteen area.",
      "Newton Block is straight ahead."
    ],
    canteen: [
      "Exit Library.",
      "Walk towards the main ground.",
      "Canteen will be on your right side."
    ],
    admin: [
      "Exit Library.",
      "Walk straight towards the main entrance.",
      "Admin Block is beside the parking area."
    ]
  },

  einstein: {
    library: [
      "Exit Einstein Block.",
      "Walk down the corridor for 20 meters.",
      "Turn right to enter the Library."
    ],
    newton: [
      "Exit Einstein Block and walk straight.",
      "Turn left next to the student lounge.",
      "Newton Block will be on your right."
    ],
    canteen: [
      "Walk to the main corridor from Einstein.",
      "Canteen will be right after the labs block."
    ],
    admin: [
      "Walk straight towards the main gate from Einstein.",
      "Admin Block is located near the parking area."
    ]
  },

  newton: {
    library: [
      "Exit Newton Block.",
      "Walk straight down the corridor.",
      "Turn right to reach the Library."
    ],
    einstein: [
      "Exit Newton Block and walk forward.",
      "Turn right at the junction; Einstein is ahead."
    ],
    canteen: [
      "From Newton, walk towards the east corridor.",
      "Canteen will be on your left."
    ],
    admin: [
      "Leave Newton, walk to main pathway and turn left.",
      "Admin Block is near the front desk area."
    ]
  },

  canteen: {
    library: [
      "Leave Canteen and walk towards the central path.",
      "Library is across the open lawn on the left."
    ],
    einstein: [
      "From Canteen, walk along the service lane.",
      "Einstein Block will be on the right after 30m."
    ],
    newton: [
      "From Canteen, head to the corridor and turn right.",
      "Newton Block is straight ahead."
    ],
    admin: [
      "Walk from Canteen along the main road toward the gate.",
      "Admin Block is beside the security post."
    ]
  },

  admin: {
    library: [
      "Exit Admin Block and walk straight toward the campus center.",
      "Turn left and you'll find the Library."
    ],
    einstein: [
      "From Admin, walk along the outer path.",
      "Einstein Block will be on your left after the parking."
    ],
    newton: [
      "From Admin, walk towards the central corridor and turn right.",
      "Newton Block is a short walk ahead."
    ],
    canteen: [
      "Exit Admin and walk towards the central plaza.",
      "Canteen is opposite the student activity area."
    ]
  }
};

export default directions;
