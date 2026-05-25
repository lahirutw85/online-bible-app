const React = require('react');

// Virtually mock the Ant Design component locale picker that caused Jest to fail
jest.mock('@rc-component/picker/locale/en_US', () => ({
  default: {}
}), { virtual: true });

jest.mock('@rc-component/picker/generate/dayjs', () => ({
  default: {}
}), { virtual: true });

// Mock matchMedia for Ant Design components
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock fetch globally BEFORE requiring other modules
const mockReferencesData = {
  "2063": "EXO 20 11",
  "2439": "EXO 31 18"
};

const mockFetch = jest.fn((url) => {
  console.log("TEST LOG: MOCKED FETCH CALL TO:", url);
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      "1": { "v": "GEN 1 1", "r": mockReferencesData }
    })
  });
});

global.fetch = mockFetch;
window.fetch = mockFetch;

const { render, act, fireEvent, screen } = require('@testing-library/react');
const App = require('./App').default;

test('Diagnostic Test: Open reference panel and check for crashes', async () => {
  console.log("STARTING DIAGNOSTIC TEST");
  
  let renderResult;
  await act(async () => {
    renderResult = render(<App />);
  });

  console.log("APP RENDERED SUCCESSFULLY, WAITING FOR GENESIS 1:1 TEXT...");

  // Wait for the verse text to load and render
  const verseText = await screen.findByText(/පටන්ගැන්මෙහිදී/i, {}, { timeout: 5000 });
  console.log("FOUND GENESIS 1:1 TEXT:", verseText.textContent);

  // Let's wait another moment for references to resolve
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  // Now find the reference links.
  const links = screen.queryAllByText(/Exod/i);
  console.log(`Found ${links.length} links containing "Exod"`);

  if (links.length > 0) {
    console.log("Reference link text:", links[0].textContent);
    console.log("Clicking the first reference link...");
    
    await act(async () => {
      fireEvent.click(links[0]);
    });
    
    console.log("Clicked reference link. Waiting for state updates...");
    
    // Check if the reference panels are rendered. Let's wait a bit.
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
    
    console.log("HTML after click:", document.body.innerHTML.substring(0, 1000));
  } else {
    console.log("No reference links found!");
  }
});
