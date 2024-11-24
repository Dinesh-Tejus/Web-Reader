# Web Reader

Web Reader is a minimalist web accessibility tool designed to enhance web browsing for individuals with visual impairments. It specifically targets individuals with partial blindness or low vision, allowing them to access and consume web content effortlessly. The tool features text-to-speech capabilities, customizable font sizes, and intuitive keyboard navigation, addressing the unique challenges faced by visually impaired users. By simplifying web content and improving readability, Web Reader offers a more inclusive and accessible browsing experience for users worldwide.

### Unique Key feature
Web Reader enables users to access any website on the internet, regardless of whether the website is equipped with built-in accessibility features. This ensures a seamless browsing experience for individuals with visual impairments, removing the need for site-specific modifications or additional tools.


## Features

- **Text-to-Speech Functionality**: Converts web content into speech for users who cannot easily read text on a screen.
- **Font Size Control**: Allows users to adjust the font size for improved readability.
- **AI-Powered Content Summarization**: Summarizes lengthy content, making it easier for users to consume information.
- **Keyboard Navigation**: Entirely Keyboard-navigable interface, facilitating easy browsing without the need for a mouse. (Except for Recent links)
- **Pause/Resume Function**: Gives users control over when to pause and resume the speech output, providing flexibility.
- **Clear and Simple Interface**: Focuses on functionality, ensuring ease of use for individuals with varying levels of vision impairment.

## Installation
Before starting the installation for the Web-Reader, please install Node.js and python on your system
- For Node.js follow : [Node.js Package Manager Installation Guide](https://nodejs.org/en/download/package-manager).
- For python Follow this link : [Python Installer](https://www.python.org/downloads/).

To install and use the Web Reader, follow these steps:

1. Clone the repository:
```bash
git clone https://github.com/Dinesh-Tejus/web-reader.git
```

2. Navigate to the project directory:
```bash
cd web-reader
```

3. Create and activate a virtual environment:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

4. Install all the necessary packages
```bash
npm install
pip install -r requirements.txt

```

5. Create an .env environment file. 
- Navigate into the backend folder and create a .env file
```bash
GROQ_API_KEY="<your-api-key-here>"
```

6. Run the frontend by running the following in the root directory
```bash
npm start
```
You will see something like this

```
You can now view web-reader in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://10.1.0.173:3000
```

7. Run the backend from root directory
```bash
python backend/backend.py  
```

8. **Access the Web Interface**:
Open your browser and navigate to `http://localhost:3000` or the url as seen in terminal on running frontend to start using the Web Reader.

## Important Files

- **Backend.py**: Contains the core logic for web scraping and content summarization. The URL passed is scraped for relevant content and then sent to a Large Language Model (LLM) for processing and summarization.
- **App.js**: Handles the front-end logic, including user interactions and communication with the backend.
- **App.css**: Contains the styling rules for the front-end, ensuring a clean and user-friendly interface.

## Technologies Used

- **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python, used for serving the backend.
- **LLM Inferencing (Llama-70b)**: Uses the Llama-70b model for natural language processing, enabling content extraction and summarization from websites.
- **Groq**: A hardware accelerator for LLM inferencing, improving performance and scalability of AI tasks.
- **React**: A popular JavaScript library for building user interfaces, used for developing the front-end of the web reader application.
- **BeautifulSoup**: A powerful Python library for web scraping, used to extract structured data from HTML content on web pages.
- **SpeechSynthesisUtterance**: A built-in JavaScript API for converting text to speech, enabling the text-to-speech functionality in the Web Reader interface.
