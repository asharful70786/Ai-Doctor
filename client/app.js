let data = await fetch('http://192.168.29.248:4000/ask' , {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: " what is Abscess ?",
  }),
}).then((response) => {
  return response.json();
});

// let count = await data.json();
console.log(data.answer);
console.log(data.total);