# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Adaptive Chat Feature

The application now includes an Adaptive Chat feature that connects to the Custom-AI adaptive chatbot. This feature provides:

1. **User Profile Tracking** - The chatbot remembers user preferences and adapts over time
2. **Probing Questions** - The chatbot can ask follow-up questions to gather more information
3. **Streaming Support** - Real-time message streaming for a better user experience

### Accessing Adaptive Chat

Navigate to `/adaptive-chat` in your browser after starting the application.

### Connecting to Custom-AI Backend

The Adaptive Chat feature requires the Custom-AI backend to be running. Make sure to:

1. Start the Custom-AI backend server:
   ```
   cd ../Custom-AI
   python app.py
   ```

2. Ensure the adaptive-chat endpoints are accessible at `http://localhost:8000/adaptive-chat`

### User Profile

The adaptive chat feature automatically builds and updates a user profile based on interactions. This profile is used to tailor responses to the user's needs and preferences over time.
![image](https://res.cloudinary.com/deb6egoxo/image/upload/v1747107755/robokki_images/762612d5-6854-4afa-96a2-547a51c932ab.png)