// const retellApis = async () => {
// // Create a new agent
// const newAgent = await retell.createAgent({
//   voiceId: "1",
//   prompt: "You are a helpful agent?",
//   beginMessage: "hi how are you doing?",
//   enableBeginMessage: true,
//   endMessage: "have a nice day",
//   enableEndMessage: true,
//   agentName: "tom",
// });
// console.log("new agent: " + newAgent);

// List information of all agents created
// const allAgents = await retell.listAgents();
// console.log("list agents: " + allAgents);
// console.log(allAgents);

// Get an agent information
// const agent = await retell.getAgent({
//   agentId: demoAgentId,
// });
// console.log("get agent: " + agent);

// Update an agent's information
// const updatedAgent = await retell.updateAgent({
//   agentId: demoAgentId,
//   voiceId: "xxcrwXReTKMHWjqi7Q27",
//   prompt: "You are a helpful agent, and also you are nice",
//   beginMessage: "hi how are you doing?",
//   endMessage: "have a nice day",
//   enableBeginMessage: true,
//   enableEndMessage: true,
//   agentName: "tommy",
// });
// console.log("updated agent: " + updatedAgent);

// // Delete an agent
// const deleteAgentStatus = await retell.deleteAgent({
//   agentId: "Cc2zh1x9jcEdo8rEsrQSlaxiDqbN3J8Z",
// });
// console.log("deleted agent: " + deleteAgentStatus);

// List all converstaions happened
// const allConversations = await retell.listConversations();
// console.log("list of all conversations: " + allConversations);

// // Get a specific conversation happened
// const conversation = await retell.getConversation({
//   eventId: demoAgentId,
// });
// console.log("get a conversation: " + conversation);

// // Purchase a new phone number and ready for inbound
// const newPhoneNumber = await retell.createPhoneNumber({
//   areaCode: "312",
//   agentId: "LzyWvJtX6q2OwXPfroOR5tiIs80s7WFu",
// });
// console.log("created phone number: " + newPhoneNumber);

// Get a specific purchased phone number
// const phoneNumber = await retell.getPhoneNumber({
//   phoneNumber: "+13125869978",
// });
// console.log("get phone number: " + phoneNumber);

// // List all purchased phone numbers
// const allPhoneNumbers = await retell.listPhoneNumber();
// console.log("get all phone numbers: " + allPhoneNumbers);

// // Delete a purchased phone number
// const deletePhoneStatus = await retell.deletePhoneNumber({
//   phoneNumber: "123",
// });
// console.log("delete a phone number: " + deletePhoneStatus);

// Update a phone number's agent for inbound and outbound
// const updatedPhoneNumber = await retell.updatePhone({
//   phoneNumber: "+13125869978",
//   agentId: "e3zOZReyqP2yMpfkdXfQCmX2XOzWgK7X",
// });
// console.log("updated phone number: " + updatedPhoneNumber);

// // Create a outbound call with a From number and To number
// const currentPhoneConversation = await retell.createOutboundCall({
//   fromNumber: "123",
//   toNumber: "123",
// });
// console.log("current outbound call: " + currentPhoneConversation);
// };

// useEffect(() => {
//   retellApis();
// }, [retell]);
