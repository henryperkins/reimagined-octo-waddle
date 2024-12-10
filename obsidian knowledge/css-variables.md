You're asking about CSS variables (also known as custom properties) within Obsidian. While Obsidian doesn't have a dedicated API for manipulating CSS variables, understanding how to use them is crucial for styling your plugin's interface to match Obsidian's theme and maintain a consistent look and feel.

**How to Use CSS Variables in Obsidian Plugins**

1. **Accessing Obsidian's CSS Variables:**  Obsidian defines a set of CSS variables that control the colors, fonts, spacing, and other styling aspects of its interface. You can access these variables within your plugin's CSS by using the `var()` function.

   *   **Example:**

       ```css
       /* Set the background color of a plugin element to match Obsidian's background color */
       .my-plugin-element {
         background-color: var(--background-primary);
       }

       /* Set text color to match Obsidian's primary text color */
       .my-plugin-text {
           color: var(--text-normal);
       }
       ```

2. **Where to Define Your Plugin's CSS:** Define your plugin's CSS rules in a separate CSS file (e.g., `styles.css`) and include it in your plugin's `manifest.json` file.

   *   **manifest.json:**

       ```json
       {
         "id": "my-plugin",
         "name": "My Plugin",
         // ... other manifest properties
         "css": ["styles.css"]
       }
       ```

3. **List of Common Obsidian CSS Variables:** You can find a comprehensive, albeit unofficial, list of Obsidian's CSS variables here: [https://docs.obsidian.md/Reference/CSS+variables/CSS+variables](https://docs.obsidian.md/Reference/CSS+variables/CSS+variables). This list is incredibly helpful as a reference. It's not exhaustive, and Obsidian might add or change variables over time, but it covers most common styling needs.

4. **Inspecting Obsidian's Styles:**  The most reliable way to find the exact CSS variable you need is to use your browser's developer tools to inspect Obsidian's interface. Right-click on an element in Obsidian and select "Inspect" or "Inspect Element." This will open the developer tools and show you the CSS rules applied to that element, including the CSS variables being used.

5. **Important Considerations:**

    *   **Theme Compatibility:** Using Obsidian's CSS variables ensures that your plugin's appearance adapts to different themes. When users switch themes, the values of these variables change, automatically updating your plugin's styling.
    *   **Specificity:**  Be mindful of CSS specificity. If your CSS rules are too general, they might be overridden by Obsidian's own styles. Use more specific selectors (e.g., classes, IDs) to target your plugin's elements precisely.
    *   **Updates:**  Obsidian might update its CSS variables in future releases. It's a good practice to occasionally check for changes and update your plugin's CSS accordingly. The community-maintained list mentioned above can be helpful for tracking changes.

**Example: Styling a Modal**

```css
/* Style the modal title */
.my-modal .modal-title {
  color: var(--text-muted); /* A slightly muted color for the title */
}

/* Style the modal content */
.my-modal .modal-content {
    background-color: var(--background-primary); /* Match Obsidian's background */
    color: var(--text-normal); /* Match Obsidian's text color */
}

/* Style buttons within the modal */
.my-modal .setting-item-control button {
    background-color: var(--interactive-accent); /* Use Obsidian's accent color */
    color: var(--interactive-accent-text); /* Text color for accent backgrounds */
}
```

By leveraging Obsidian's CSS variables, you can seamlessly integrate your plugin's interface into the overall Obsidian experience, ensuring a consistent and visually appealing design. Remember to inspect Obsidian's styles and refer to the community-maintained list of CSS variables to find the properties you need.
