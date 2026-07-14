import Papa from 'papaparse';
import { CSV_COLUMNS } from '../constants';

const CACHE_KEY = 'familyTreeData';
const CACHE_EXPIRATION = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

export const fetchFamilyData = async (forceRefresh: boolean = false): Promise<any[]> => {
  const cachedDataString = localStorage.getItem(CACHE_KEY);
  if (cachedDataString && !forceRefresh) {
    try {
      const cachedData = JSON.parse(cachedDataString);
      const now = new Date().getTime();
      
      if (now - cachedData.timestamp < CACHE_EXPIRATION) {
        console.log("Loading family tree from Local Storage...");
        
        const timestampDate = new Date(cachedData.timestamp);
        const options: Intl.DateTimeFormatOptions = {
          timeZone: 'Asia/Kolkata',
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: true
        };
        const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(timestampDate);
        let dd, mm, yyyy, hh, min, ss, ampm;
        for (const part of parts) {
          if (part.type === 'day') dd = part.value;
          if (part.type === 'month') mm = part.value;
          if (part.type === 'year') yyyy = part.value;
          if (part.type === 'hour') hh = part.value;
          if (part.type === 'minute') min = part.value;
          if (part.type === 'second') ss = part.value;
          if (part.type === 'dayPeriod') ampm = part.value.toUpperCase();
        }
        console.log(`${dd}-${mm}-${yyyy}_${hh}:${min}:${ss}_${ampm}`);
        
        return cachedData.data;
      }
    } catch (e) {
      // Cache is invalid, ignore and fetch fresh
    }
  }

  console.log("Fetching fresh family tree data from CSV...");

  const res = await fetch('/data.csv');
  const csv = await res.text();
  
  return parseCSVString(csv);
};

export const parseCSVString = (csv: string): Promise<any[]> => {
  return new Promise((resolve) => {
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleaned = results.data.map((row: any) => {
          const newRow: any = {};
          for (const key in row) {
            newRow[key.trim()] = typeof row[key] === 'string' ? row[key].trim() : row[key];
          }
          return newRow;
        }).filter((row: any) => row[CSV_COLUMNS.EMAIL]);

        // Deduplicate by email
        const uniqueEmails = new Set();
        const deduplicated = cleaned.filter((row: any) => {
          const email = row[CSV_COLUMNS.EMAIL];
          if (uniqueEmails.has(email)) return false;
          uniqueEmails.add(email);
          return true;
        });
        
        // Save to cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: new Date().getTime(),
            data: deduplicated
          }));
        } catch (e) {
          // Ignore quota errors silently
        }

        resolve(deduplicated);
      }
    });
  });
};
