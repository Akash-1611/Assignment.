import puppeteer, { Browser, Page } from 'puppeteer';
import { IProfile } from '../types/profile.types';

export class LinkedInScraperService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isLoggedIn = false;
  private maxRetries = 3;

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: false, // Keep false for debugging
        slowMo: 200, // Increased delay
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ],
        defaultViewport: { width: 1366, height: 768 },
        timeout: 60000
      });

      this.page = await this.browser.newPage();
      
      // Enhanced stealth measures
      await this.page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
        
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });
        
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });

        // Hide automation indicators
        (window as any).chrome = {
          runtime: {},
        };

        Object.defineProperty(navigator, 'permissions', {
          get: () => ({
            query: () => Promise.resolve({ state: 'granted' }),
          }),
        });
      });
      
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // More conservative resource blocking
      await this.page.setRequestInterception(true);
      this.page.on('request', (req) => {
        const resourceType = req.resourceType();
        const url = req.url();
        
        // Only block heavy resources, allow more content through
        if (['image', 'font', 'media'].includes(resourceType) && 
            !url.includes('linkedin.com')) {
          req.abort();
        } else if (url.includes('doubleclick') || 
                   url.includes('google-analytics') ||
                   url.includes('facebook.com/tr')) {
          req.abort();
        } else {
          req.continue();
        }
      });

      this.page.on('error', (err) => {
        console.error('Page error:', err);
      });

      this.page.on('pageerror', (err) => {
        console.error('Page script error:', err);
      });
      
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      await this.cleanup();
      throw error;
    }
  }

  async login(): Promise<boolean> {
    if (!this.page) throw new Error('Browser not initialized');

    let attempts = 0;
    while (attempts < this.maxRetries) {
      try {
        console.log(`🔐 Login attempt ${attempts + 1}/${this.maxRetries}`);
        
        await this.page.goto('https://www.linkedin.com/login', { 
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
        await this.randomDelay(2000, 4000);

        // Wait for and fill login credentials
        await this.page.waitForSelector('#username', { timeout: 10000 });
        
        // Clear existing content and type slowly
        await this.page.click('#username');
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('KeyA');
        await this.page.keyboard.up('Control');
        await this.page.type('#username', process.env.LINKEDIN_EMAIL || '', { delay: 150 });
        await this.randomDelay(1000, 2000);
        
        await this.page.click('#password');
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('KeyA');
        await this.page.keyboard.up('Control');
        await this.page.type('#password', process.env.LINKEDIN_PASSWORD || '', { delay: 150 });
        await this.randomDelay(1000, 2000);

        // Click login button
        await this.page.click('button[type="submit"]');
        console.log('🔄 Logging in...');
        
        // Wait for either success or failure
        await Promise.race([
          this.page.waitForSelector('.feed-identity-module', { timeout: 20000 }),
          this.page.waitForSelector('.challenge-page', { timeout: 20000 }),
          this.page.waitForSelector('#captcha-internal', { timeout: 20000 }),
          this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 })
        ]);

        await this.randomDelay(2000, 3000);

        // Check login status
        const currentUrl = this.page.url();
        console.log('Current URL:', currentUrl);

        // Success indicators
        if (currentUrl.includes('/feed/') || 
            currentUrl.includes('/in/') ||
            await this.page.$('.feed-identity-module')) {
          this.isLoggedIn = true;
          console.log('✅ Successfully logged into LinkedIn');
          return true;
        }
        
        // Handle CAPTCHA
        if (await this.page.$('#captcha-internal') || currentUrl.includes('challenge')) {
          console.log('⚠️  CAPTCHA or challenge detected. Waiting for manual resolution...');
          console.log('Please solve the CAPTCHA in the browser window and press Enter here to continue...');
          
          // Wait for user input
          await new Promise(resolve => {
            process.stdin.once('data', () => resolve(null));
          });
          
          // Check again after manual intervention
          await this.randomDelay(2000, 3000);
          const newUrl = this.page.url();
          if (newUrl.includes('/feed/') || await this.page.$('.feed-identity-module')) {
            this.isLoggedIn = true;
            console.log('✅ Login successful after manual intervention');
            return true;
          }
        }
        
        // Check for error messages
        const errorElement = await this.page.$('.form__label--error');
        if (errorElement) {
          const errorText = await errorElement.evaluate(el => el.textContent);
          console.log('❌ Login error:', errorText);
        }

        attempts++;
        if (attempts < this.maxRetries) {
          console.log('🔄 Retrying login...');
          await this.randomDelay(5000, 8000);
        }

      } catch (error) {
        console.error(`❌ Login attempt ${attempts + 1} failed:`, error);
        attempts++;
        
        if (attempts < this.maxRetries) {
          await this.randomDelay(5000, 8000);
        }
      }
    }

    console.error('❌ All login attempts failed');
    return false;
  }

  async scrapeProfiles(searchUrl: string, maxProfiles: number = 20): Promise<IProfile[]> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Must be logged in to scrape profiles');
    }

    const profiles: IProfile[] = [];
    let attempts = 0;
    
    while (attempts < this.maxRetries) {
      try {
        console.log(`🔍 Starting scrape attempt ${attempts + 1} from: ${searchUrl}`);
        
        await this.page.goto(searchUrl, { 
          waitUntil: 'networkidle2', // Wait for network to be idle
          timeout: 45000 
        });
        await this.randomDelay(5000, 8000); // Longer initial wait

        // Debug: Take screenshot to see what's loaded
        await this.page.screenshot({ path: `debug-search-${Date.now()}.png`, fullPage: false });

        // Check if we're still logged in
        const isLoggedIn = await this.checkLoginStatus();
        if (!isLoggedIn) {
          throw new Error('Session expired, need to re-login');
        }

        // More comprehensive selector waiting
        const searchResultsLoaded = await this.waitForSearchResults();

        if (!searchResultsLoaded) {
          throw new Error('Search results failed to load - no valid selectors found');
        }

        let currentPage = 0;
        const maxPages = Math.ceil(maxProfiles / 10);

        while (profiles.length < maxProfiles && currentPage < maxPages) {
          console.log(`📄 Scraping page ${currentPage + 1}...`);

          // Get profile cards with multiple strategies
          const profileCards = await this.getProfileCards();
          console.log(`Found ${profileCards.length} profile cards on page ${currentPage + 1}`);
          
          if (profileCards.length === 0) {
            console.log('No profile cards found, checking page structure...');
            await this.debugPageStructure();
            break;
          }
          
          for (let i = 0; i < profileCards.length && profiles.length < maxProfiles; i++) {
            try {
              const profile = await this.extractProfileData(profileCards[i]);
              if (profile && !profiles.some(p => p.linkedInURL === profile.linkedInURL)) {
                profiles.push(profile);
                console.log(`✅ Scraped (${profiles.length}/${maxProfiles}): ${profile.fullName} at ${profile.company}`);
              }
            } catch (error) {
              console.log(`⚠️  Failed to extract profile ${i + 1}:`, (error as Error).message);
              continue;
            }

            await this.randomDelay(3000, 6000); // Longer delays
          }

          // Navigate to next page
          currentPage++;
          if (currentPage < maxPages && profiles.length < maxProfiles) {
            const hasNextPage = await this.goToNextPage();
            if (!hasNextPage) {
              console.log('No more pages available');
              break;
            }
          }
        }

        console.log(`🎉 Scraping completed! Found ${profiles.length} profiles`);
        return profiles;

      } catch (error) {
        console.error(`❌ Scraping attempt ${attempts + 1} failed:`, error);
        attempts++;
        
        if (attempts < this.maxRetries) {
          console.log(`🔄 Retrying scraping (${attempts + 1}/${this.maxRetries})...`);
          await this.randomDelay(15000, 20000); // Much longer retry delay
        }
      }
    }

    console.error('❌ All scraping attempts failed');
    throw new Error('Scraping failed after maximum retries');
  }

  private async waitForSearchResults(): Promise<boolean> {
    const selectors = [
      '.search-results-container',
      '.search-results',
      '.reusable-search__result-container',
      '[data-view-name="search-entity-result"]',
      '.entity-result',
      '.search-entity-result',
      '.search-result',
      '[data-view-name*="search"]',
      '.artdeco-entity-lockup'
    ];

    console.log('🔍 Waiting for search results with multiple selectors...');
    
    for (const selector of selectors) {
      try {
        console.log(`Trying selector: ${selector}`);
        await this.page!.waitForSelector(selector, { timeout: 10000 });
        console.log(`✅ Found results with selector: ${selector}`);
        return true;
      } catch (error) {
        console.log(`❌ Selector ${selector} not found`);
        continue;
      }
    }

    // Fallback: wait for any element that might contain profiles
    try {
      await this.page!.waitForFunction(() => {
        const possibleContainers = document.querySelectorAll('*[class*="search"], *[class*="result"], *[data-view-name*="search"]');
        return possibleContainers.length > 0;
      }, { timeout: 15000 });
      console.log('✅ Found search results with fallback method');
      return true;
    } catch (error) {
      console.log('❌ No search results found with any method');
      return false;
    }
  }

  private async getProfileCards(): Promise<any[]> {
    const selectors = [
      '.reusable-search__result-container',
      '[data-view-name="search-entity-result"]',
      '.entity-result',
      '.search-entity-result',
      '.search-result',
      '.artdeco-entity-lockup',
      '[data-view-name*="search"]'
    ];

    for (const selector of selectors) {
      try {
        const cards = await this.page!.$$(selector);
        if (cards.length > 0) {
          console.log(`✅ Found ${cards.length} cards with selector: ${selector}`);
          return cards;
        }
      } catch (error) {
        continue;
      }
    }

    // Fallback: get any element that looks like a profile card
    try {
      const cards = await this.page!.$$eval('*', (elements) => {
        return elements.filter(el => {
          const className = el.className?.toString() || '';
          const dataView = el.getAttribute('data-view-name') || '';
          return (className.includes('search') && className.includes('result')) ||
                 dataView.includes('search') ||
                 (className.includes('entity') && className.includes('result'));
        });
      });
      
      if (cards.length > 0) {
        console.log(`✅ Found ${cards.length} cards with fallback method`);
        return cards;
      }
    } catch (error) {
      console.log('Fallback card detection failed:', error);
    }

    return [];
  }

  private async debugPageStructure(): Promise<void> {
    try {
      console.log('🔍 Debugging page structure...');
      
      // Check what's actually on the page
      const pageInfo = await this.page!.evaluate(() => {
        const allElements = document.querySelectorAll('*[class*="search"], *[class*="result"], *[data-view-name]');
        const info = {
          url: window.location.href,
          title: document.title,
          elementCount: allElements.length,
          elements: Array.from(allElements).slice(0, 10).map(el => ({
            tagName: el.tagName,
            className: el.className,
            dataView: el.getAttribute('data-view-name'),
            id: el.id
          }))
        };
        return info;
      });
      
      console.log('Page Debug Info:', JSON.stringify(pageInfo, null, 2));
      
      // Take a screenshot for manual inspection
      await this.page!.screenshot({ 
        path: `debug-no-results-${Date.now()}.png`, 
        fullPage: true 
      });
      
      console.log('📸 Screenshot saved for debugging');
      
    } catch (error) {
      console.log('Failed to debug page structure:', error);
    }
  }

  private async checkLoginStatus(): Promise<boolean> {
    try {
      const loginIndicators = [
        '.feed-identity-module',
        '.global-nav__me',
        '.global-nav__primary-link--me',
        '[data-view-name="nav-me-view"]'
      ];

      for (const selector of loginIndicators) {
        const element = await this.page!.$(selector);
        if (element) {
          return true;
        }
      }

      // Check URL patterns
      const url = this.page!.url();
      if (url.includes('/login') || url.includes('/challenge')) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  private async extractProfileData(card: any): Promise<IProfile | null> {
    try {
      // Enhanced selectors for different LinkedIn layouts
      const nameSelectors = [
        '.entity-result__title-text a',
        '[data-test-app-aware-link]',
        '.search-result__title a',
        '.artdeco-entity-lockup__title a',
        'a[href*="/in/"]',
        '.entity-result__title-line a'
      ];

      let nameElement = null;
      for (const selector of nameSelectors) {
        nameElement = await card.$(selector);
        if (nameElement) break;
      }

      if (!nameElement) {
        console.log('⚠️  No name element found, trying text extraction...');
        // Fallback: try to extract any text that looks like a name
        const cardText = await card.evaluate((el: any) => el.textContent);
        console.log('Card text:', cardText?.substring(0, 200));
        return null;
      }

      const fullName = await nameElement.evaluate((el: any) => el.textContent?.trim());
      const profileLink = await nameElement.evaluate((el: any) => el.href);

      if (!fullName || !profileLink) return null;

      // Rest of the extraction logic remains the same...
      const headlineSelectors = [
        '.entity-result__primary-subtitle',
        '.search-result__subtitle',
        '.entity-result__summary',
        '.artdeco-entity-lockup__subtitle'
      ];

      let headline = '';
      for (const selector of headlineSelectors) {
        const element = await card.$(selector);
        if (element) {
          headline = await element.evaluate((el: any) => el.textContent?.trim());
          if (headline) break;
        }
      }

      const locationSelectors = [
        '.entity-result__secondary-subtitle',
        '.search-result__location',
        '.entity-result__location',
        '.artdeco-entity-lockup__caption'
      ];

      let location = '';
      for (const selector of locationSelectors) {
        const element = await card.$(selector);
        if (element) {
          location = await element.evaluate((el: any) => el.textContent?.trim());
          if (location) break;
        }
      }

      const headlineParts = (headline || '').split(' at ');
      const jobTitle = headlineParts[0]?.trim() || headline || 'Not specified';
      const company = headlineParts[1]?.trim() || 'Not specified';

      let cleanUrl = profileLink.startsWith('http') 
        ? profileLink 
        : `https://www.linkedin.com${profileLink}`;
      
      cleanUrl = cleanUrl.split('?')[0];

      return {
        fullName,
        headline: headline || '',
        jobTitle,
        company,
        location: location || '',
        linkedInURL: cleanUrl,
        about: '',
        scrapedAt: new Date(),
      };

    } catch (error) {
      console.error('Error extracting profile data:', error);
      return null;
    }
  }

  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
    } catch (error) {
      console.error('Error closing page:', error);
    }

    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      console.error('Error closing browser:', error);
    }

    this.isLoggedIn = false;
  }

  async close(): Promise<void> {
    console.log('🔄 Closing browser...');
    await this.cleanup();
    console.log('✅ Browser closed successfully');
  }

  // Add method to check if scraper is still alive
  async isAlive(): Promise<boolean> {
    try {
      return !!(this.browser && this.page && !this.browser.disconnected);
    } catch {
      return false;
    }
  }

  // Add method to reinitialize if needed
  async ensureAlive(): Promise<void> {
    const alive = await this.isAlive();
    if (!alive) {
      console.log('🔄 Browser disconnected, reinitializing...');
      await this.cleanup();
      await this.initialize();
      
      if (!this.isLoggedIn) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('Failed to re-login after browser restart');
        }
      }
    }
  }
}