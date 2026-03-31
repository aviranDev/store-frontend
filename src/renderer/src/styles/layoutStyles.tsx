import styled, { createGlobalStyle } from 'styled-components'

/* Global Styles */
export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Courier New', monospace; /* Retro font */
  }

  /* CSS Variables */
  :root {
  --primary-color: #000000; /* Dark Black */
  --secondary-color: #808080; /* Gray for retro feel */
  --accent-color: #FFFFFF; /* White */
  --background-color: #C0C0C0; /* Light gray for retro background */

  --text-color: #000000; /* Black for text */
  --border-color: #404040; /* Dark gray for prominent borders */
  --shadow-color: #808080; /* Light shadow for retro effect */
  --success-color: #28a745; /* Green for success */
  --warning-color: #ffc107; /* Yellow for warnings */
  --error-color: #9d0e1c; /* Red for errors */
  --button-background: #B0B0B0; /* Button background gray */

  /* Additional retro colors */
  --teal-accent: #008080; /* 90s teal */
  --mauve-accent: #800080; /* 90s purple */
  --yellow-green-accent: #808000; /* Muted yellow-green */
  }

  body {
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 14px; /* Slightly smaller font size for retro feel */
    line-height: 1.4;
    margin: 0;
  }

  /* This applies the scrollbar styles globally */
  ::-webkit-scrollbar {
    width: 12px;
    background-color: var(--secondary-color);
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--border-color);
    border: 1px solid var(--shadow-color);
  }

`

/* Template Container Styles */
export const LayoutContainer = styled.div`
  display: grid;
  min-height: 100vh;

  grid-template-areas:
    'sidebar nav nav nav'
    'sidebar main main main'
    'sidebar footer footer footer';
  grid-template-rows: auto 1fr auto; /* Adjusted to allow the navbar to fit */
  grid-template-columns: 15% 1fr 1fr 1fr;
  transition: all 0.25s ease-in-out; /* Keep transition for navbar */

  @media (max-width: 700px) {
    display: flex;
    flex-direction: column;
    overflow-y: visible; /* Adjust overflow behavior for smaller screens if needed */
  }
`
