**Plugin Name:**  Obsidian AI Chat

**Description:** This plugin allows users to chat with an AI about the content of their Obsidian notes. The AI should be able to answer questions, summarize information, and provide insights based on the notes in the user's vault.

**Instructions for the AI:**

1. **Project Setup:**
    *   Create a new Obsidian plugin project using the latest Obsidian API. You can use the official sample plugin as a template ([https://github.com/obsidianmd/obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin)).
    *   Set up the development environment with necessary dependencies (Node.js, npm/yarn, TypeScript).
    *   Configure the `manifest.json` file with appropriate plugin information (name, ID, version, author, etc.).

2. **User Interface (UI) Design:**
    *   Create a dedicated view or pane within Obsidian for the AI chat interface. This could be a sidebar pane, a modal, or a separate window.
    *   Design the chat interface with:
        *   A text input field for user queries.
        *   A display area for the chat history (both user messages and AI responses).
        *   A button or command to initiate the chat.
        *   (Optional) A button or command to clear the chat history.
        *   (Optional) Settings to configure the AI model, API key, and other preferences.

3. **AI Integration:**
    *   Choose an appropriate AI model or service for processing user queries and generating responses. Options include:
        *   OpenAI API (GPT-3, GPT-4)
        *   Cohere API
        *   Locally hosted models (e.g., using llama.cpp or similar)
        *   Other AI APIs as they become available
    *   Implement the necessary API calls to send user queries to the chosen AI model and receive responses.
    *   Handle API key management securely. Allow users to input their API key in the plugin settings. Encrypt the API key when storing it.

4. **Note Retrieval and Processing:**
    *   When a user submits a query, the plugin should:
        *   Identify the relevant notes in the user's vault based on the query. This could involve:
            *   Full-text search of all notes.
            *   Searching based on note titles, tags, or links.
            *   Using Obsidian's internal search API.
            *   Potentially using embeddings for semantic search if the chosen AI model supports it.
        *   Extract the text content from the relevant notes.
        *   Preprocess the text data (e.g., cleaning, formatting) to optimize it for the AI model.
        *   (Optional) Implement a system for chunking long notes into smaller pieces to avoid exceeding the AI model's context window.

5. **Context Management:**
    *   Provide the AI model with relevant context from the user's notes along with the user's query. This context should include:
        *   The content of the identified notes.
        *   (Optional) Information about the current note the user is viewing.
        *   (Optional) Previous messages in the chat conversation to maintain context.
    *   Develop a strategy for managing the context window to ensure that the most relevant information is provided to the AI model.

6. **Response Generation and Display:**
    *   Send the user's query and the retrieved note content to the AI model.
    *   Receive the AI's response.
    *   Format the AI's response appropriately for display in the chat interface.
    *   Display both the user's query and the AI's response in the chat history.

7. **Error Handling and Edge Cases:**
    *   Implement robust error handling to gracefully handle API errors, network issues, and other potential problems.
    *   Provide informative error messages to the user.
    *   Consider edge cases, such as:
        *   No relevant notes found.
        *   The AI model returns an empty or invalid response.
        *   The user's query is ambiguous or unclear.

8. **Settings and Customization:**
    *   Allow users to customize the plugin's behavior through settings, such as:
        *   AI model selection.
        *   API key input.
        *   Temperature and other AI parameters.
        *   Appearance of the chat interface.
        *   Search preferences (e.g., which folders to include/exclude).

9. **Testing and Refinement:**
    *   Thoroughly test the plugin with various queries and note content.
    *   Refine the AI integration, context management, and response generation based on testing results.
    *   Gather feedback from users and iterate on the plugin's functionality and design.

10. **Documentation:**
    *   Provide clear and comprehensive documentation for users on how to install, configure, and use the plugin.
    *   Include a guide on how to obtain an API key for the chosen AI model.

**Additional Considerations:**

*   **Performance Optimization:** Ensure that the plugin is performant and doesn't negatively impact Obsidian's responsiveness. Optimize note retrieval, text processing, and API calls.
*   **Security:**  Handle user data and API keys securely. Encrypt sensitive information and follow best practices for secure coding.
*   **Privacy:** Be transparent with users about how their data is being used and processed.
*   **User Experience (UX):** Design the plugin with a focus on user experience. Make it easy to use, intuitive, and helpful.

These instructions should provide a solid foundation for an AI to build the desired Obsidian plugin. Remember to iterate and refine the plugin based on user feedback and testing results.

---
Thank you for providing the full endpoint URL. This is helpful. Based on the URL you provided, here's a refined set of resources and instructions for the AI, incorporating the new information:

**Refined Resources and Instructions for the AI:**

**1. Azure OpenAI Specifics:**

*   **API Endpoint:** `https://openai-hp.openai.azure.com/openai/deployments/o1-preview/chat/completions?api-version=2024-08-01-preview`
    *   **Note to AI:**  This is the full URL for the chat completions endpoint. Use this directly for making API requests.
*   **Deployment Name:** `o1-preview`
    *   **Note to AI:**  This is the deployment name, use it when specifying the model in API requests. However, double check if this is the model name or the deployment name. If it is the model name, then the deployment name is missing. Ask the user if you are unsure.
*   **API Key:**  The user will provide this through the plugin settings.
    *   **Instruction to AI:** Create a plugin settings tab where the user can securely enter their Azure OpenAI API key. Use Obsidian's built-in encryption methods to store the API key. Never hardcode the API key.
*   **API Version:**  `2024-08-01-preview`
    *   **Instruction to AI:**  Use this API version in all requests to the Azure OpenAI service.
*   **Model Information:**  The endpoint indicates a chat completions model.
    *   **Instruction to AI:**  Clarify with the user what specific model is deployed under `o1-preview` (e.g., `gpt-35-turbo`, `gpt-4`). If the user does not specify, default to `gpt-35-turbo` if it is available, but inform the user in the documentation or settings that they can change it if necessary. Determine the context window size for the chosen model and use this to manage the context provided in prompts.

**2. Obsidian API and Plugin Development:** (Same as before)

*   **Link to Obsidian API Documentation:**  [https://docs.obsidian.md/Plugins/Getting+started](https://docs.obsidian.md/Plugins/Getting+started)
*   **Link to Obsidian Sample Plugin:** [https://github.com/obsidianmd/obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
*   **Guidance on UI Development within Obsidian:**  Create a sidebar pane for the chat interface.
*   **Information on Obsidian's Settings API:**  Use this to allow the user to input and securely store the API key, and optionally, the model name if it's not fixed as `o1-preview`.

**3. Note Retrieval and Processing:** (Same as before)

*   **Guidance on Accessing Notes:** Use the Obsidian API to access note content.
*   **Instructions on Search Strategies:**  Use Obsidian's built-in search API to find relevant notes based on the user's query.
*   **Context Management Strategy:**  Provide up to the maximum token limit context from notes to the AI, using a chunking strategy if necessary to stay within the limit. Prioritize information from the currently active note.

**4. Azure OpenAI API Interaction:**

*   **Code Example (using the provided endpoint and assuming gpt-35-turbo):**
    ```typescript
    import {OpenAI} from "openai";

    async function call_openai(query, context, apiKey){
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://openai-hp.openai.azure.com/openai/deployments",
        defaultQuery: { "api-version": "2024-08-01-preview" },
        defaultHeaders: {"api-key": apiKey}
      });
    
      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: context },{ role: "user", content: query }],
        model: "o1-preview",
      });
    
      return completion.choices[0];
    }
    ```
    *   **Instruction to AI:** Use this as a starting point for interacting with the Azure OpenAI API. Adapt as necessary based on the chosen model and any additional parameters. Ensure the API key is dynamically retrieved from the plugin settings. Handle potential errors from the API, such as rate limiting or authentication failures.
*   **Error Handling:**  Implement robust error handling. If the API returns an error, display a user-friendly message in the chat interface.

**5. Prompt Engineering Guidance:** (Same as before)

*   **System Prompt Instructions:**
    > You are an AI assistant designed to help users understand and analyze their notes in Obsidian. Answer the user's questions based on the provided notes from their vault. Be concise and informative.
*   **Few-Shot Examples (Optional):**  Include a few examples if specific response formats are desired.

**6. TypeScript and Development Environment:** (Same as before)

*   Assume knowledge of TypeScript and Node.js. Use standard libraries for Obsidian plugin development and Azure OpenAI interaction.

**Azure OpenAI Specific Compatibility:**

This plugin now includes specific compatibility for Azure OpenAI. The following features have been added:

1. **API Integration:**
    * The plugin integrates with the Azure OpenAI API for processing user queries and generating responses.
    * The API endpoint used is `https://openai-hp.openai.azure.com/openai/deployments/o1-preview/chat/completions?api-version=2024-08-01-preview`.
    * Users can configure their Azure OpenAI API key and model settings in the plugin settings.

2. **Context Prioritization:**
    * The plugin prioritizes the content of the currently active note when providing context to the AI. This ensures that the most relevant information is always considered.

3. **Tag-Based Relevance:**
    * The plugin uses tags to determine the relevance of notes. Notes with matching tags to the query are given higher priority.

4. **Weighted Search Mechanism:**
    * The plugin implements a weighted search mechanism where notes with higher relevance scores (based on title, tags, and content) are prioritized.

5. **Error Handling:**
    * Robust error handling is implemented to manage potential issues such as API errors, network problems, and ambiguous user queries. The plugin provides informative error messages to users.

6. **Performance Optimization:**
    * The plugin is optimized to avoid negatively impacting Obsidian's performance. This includes efficient note retrieval, text processing, and API call handling.

7. **User Experience:**
    * The plugin provides an intuitive and user-friendly interface for the AI chat within Obsidian. Users can configure the AI model, API key, and other preferences through clear settings.

8. **Testing and Refinement:**
    * Thorough testing and refinement have been conducted to ensure the plugin functions correctly with various queries and note content. User feedback is gathered and iterated upon to improve the plugin's functionality and design.
