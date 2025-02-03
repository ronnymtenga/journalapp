const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer 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`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: "Hello, how are you?",
    }),
  });
  
  const data = await response.json();
  console.log(data);
  
  export{};