import React, { useState, useEffect, useMemo } from 'react';
import { 
  Moon, Sun, Utensils, Activity, ChevronLeft, ChevronRight, 
  Plus, Save, Trash2, PieChart, BarChart2, Info, Droplet,
  Sparkles, X, Smartphone, LogOut, User, Clock, Settings, Key, 
  Flame, WifiOff, Search, AlertTriangle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  GoogleAuthProvider, 
  signInWithPopup,    
  signOut,            
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot,
  getDoc
} from 'firebase/firestore';

// --- MASSIVE INDIAN FOOD DATABASE (150+ Items) ---
const INDIAN_FOOD_DB = [
  // --- ROTI & BREADS ---
  { name: 'Roti (Whole Wheat)', calories: 104, protein: 3, carbs: 22, fat: 0.5, fiber: 2.5, vitA: 0, vitC: 0, iron: 6, calcium: 2 },
  { name: 'Tandoori Roti', calories: 110, protein: 3, carbs: 24, fat: 0.5, fiber: 2, vitA: 0, vitC: 0, iron: 5, calcium: 2 },
  { name: 'Butter Naan', calories: 320, protein: 8, carbs: 48, fat: 10, fiber: 2, vitA: 4, vitC: 0, iron: 8, calcium: 4 },
  { name: 'Garlic Naan', calories: 330, protein: 9, carbs: 48, fat: 11, fiber: 2, vitA: 2, vitC: 2, iron: 6, calcium: 5 },
  { name: 'Kulcha (Plain)', calories: 240, protein: 7, carbs: 40, fat: 4, fiber: 2, vitA: 0, vitC: 0, iron: 4, calcium: 3 },
  { name: 'Amritsari Kulcha', calories: 380, protein: 10, carbs: 55, fat: 12, fiber: 3, vitA: 5, vitC: 4, iron: 8, calcium: 6 },
  { name: 'Paratha (Plain)', calories: 260, protein: 6, carbs: 34, fat: 12, fiber: 3, vitA: 2, vitC: 0, iron: 6, calcium: 3 },
  { name: 'Aloo Paratha', calories: 330, protein: 8, carbs: 48, fat: 14, fiber: 4, vitA: 4, vitC: 12, iron: 8, calcium: 5 },
  { name: 'Gobi Paratha', calories: 290, protein: 7, carbs: 45, fat: 11, fiber: 5, vitA: 4, vitC: 25, iron: 8, calcium: 8 },
  { name: 'Paneer Paratha', calories: 360, protein: 14, carbs: 42, fat: 18, fiber: 3, vitA: 6, vitC: 2, iron: 6, calcium: 20 },
  { name: 'Methi Paratha', calories: 280, protein: 7, carbs: 38, fat: 11, fiber: 5, vitA: 15, vitC: 8, iron: 12, calcium: 8 },
  { name: 'Missi Roti', calories: 140, protein: 6, carbs: 20, fat: 4, fiber: 4, vitA: 2, vitC: 0, iron: 8, calcium: 5 },
  { name: 'Makki Di Roti', calories: 150, protein: 3, carbs: 24, fat: 5, fiber: 3, vitA: 8, vitC: 2, iron: 4, calcium: 3 },
  { name: 'Roomali Roti', calories: 180, protein: 5, carbs: 35, fat: 2, fiber: 1, vitA: 0, vitC: 0, iron: 2, calcium: 2 },
  { name: 'Bhatura (1 pc)', calories: 280, protein: 6, carbs: 40, fat: 12, fiber: 1, vitA: 0, vitC: 0, iron: 3, calcium: 2 },
  { name: 'Puri (1 pc)', calories: 140, protein: 2, carbs: 18, fat: 7, fiber: 1, vitA: 0, vitC: 0, iron: 2, calcium: 1 },
  { name: 'Thepla', calories: 120, protein: 3, carbs: 18, fat: 5, fiber: 2, vitA: 8, vitC: 4, iron: 6, calcium: 4 },

  // --- RICE & NOODLES ---
  { name: 'Plain Rice (1 cup)', calories: 205, protein: 4, carbs: 45, fat: 0.5, fiber: 0.5, vitA: 0, vitC: 0, iron: 2, calcium: 1 },
  { name: 'Jeera Rice', calories: 230, protein: 4, carbs: 46, fat: 4, fiber: 1, vitA: 1, vitC: 0, iron: 4, calcium: 2 },
  { name: 'Veg Pulao', calories: 300, protein: 5, carbs: 50, fat: 8, fiber: 4, vitA: 20, vitC: 10, iron: 5, calcium: 4 },
  { name: 'Peas Pulao', calories: 280, protein: 6, carbs: 48, fat: 6, fiber: 5, vitA: 10, vitC: 15, iron: 6, calcium: 4 },
  { name: 'Veg Biryani', calories: 380, protein: 8, carbs: 65, fat: 12, fiber: 6, vitA: 25, vitC: 15, iron: 10, calcium: 8 },
  { name: 'Hyderabadi Biryani', calories: 450, protein: 18, carbs: 60, fat: 16, fiber: 4, vitA: 20, vitC: 12, iron: 12, calcium: 10 },
  { name: 'Khichdi', calories: 210, protein: 8, carbs: 38, fat: 3, fiber: 4, vitA: 2, vitC: 0, iron: 5, calcium: 4 },
  { name: 'Lemon Rice', calories: 250, protein: 4, carbs: 45, fat: 8, fiber: 2, vitA: 2, vitC: 15, iron: 4, calcium: 3 },
  { name: 'Curd Rice', calories: 280, protein: 8, carbs: 40, fat: 10, fiber: 1, vitA: 4, vitC: 2, iron: 2, calcium: 25 },
  { name: 'Maggi Noodles (1 pack)', calories: 310, protein: 6, carbs: 42, fat: 13, fiber: 2, vitA: 0, vitC: 0, iron: 10, calcium: 2 },
  { name: 'Veg Chowmein', calories: 450, protein: 8, carbs: 60, fat: 18, fiber: 4, vitA: 10, vitC: 5, iron: 8, calcium: 4 },
  { name: 'Hakka Noodles', calories: 380, protein: 7, carbs: 55, fat: 14, fiber: 3, vitA: 8, vitC: 4, iron: 6, calcium: 3 },

  // --- DALS (LENTILS) ---
  { name: 'Dal Tadka (Yellow)', calories: 260, protein: 14, carbs: 32, fat: 9, fiber: 8, vitA: 10, vitC: 5, iron: 15, calcium: 6 },
  { name: 'Dal Makhani', calories: 350, protein: 14, carbs: 28, fat: 22, fiber: 7, vitA: 12, vitC: 2, iron: 10, calcium: 12 },
  { name: 'Dal Fry', calories: 220, protein: 12, carbs: 30, fat: 8, fiber: 7, vitA: 8, vitC: 4, iron: 12, calcium: 5 },
  { name: 'Panchmel Dal', calories: 280, protein: 16, carbs: 35, fat: 8, fiber: 9, vitA: 5, vitC: 2, iron: 14, calcium: 8 },
  { name: 'Kadhi Pakora', calories: 280, protein: 8, carbs: 25, fat: 16, fiber: 2, vitA: 10, vitC: 4, iron: 4, calcium: 15 },
  { name: 'Rajma Masala', calories: 260, protein: 14, carbs: 38, fat: 7, fiber: 12, vitA: 6, vitC: 8, iron: 22, calcium: 10 },
  { name: 'Chole (Chickpeas)', calories: 280, protein: 12, carbs: 40, fat: 8, fiber: 10, vitA: 8, vitC: 15, iron: 20, calcium: 8 },
  { name: 'Lobia (Black Eye Peas)', calories: 240, protein: 14, carbs: 36, fat: 6, fiber: 9, vitA: 5, vitC: 6, iron: 18, calcium: 9 },

  // --- SABZI (NORTH INDIAN) ---
  { name: 'Aloo Gobi', calories: 180, protein: 5, carbs: 24, fat: 8, fiber: 6, vitA: 8, vitC: 60, iron: 10, calcium: 8 },
  { name: 'Jeera Aloo', calories: 200, protein: 4, carbs: 28, fat: 8, fiber: 4, vitA: 2, vitC: 15, iron: 8, calcium: 4 },
  { name: 'Bhindi Masala', calories: 160, protein: 4, carbs: 14, fat: 10, fiber: 6, vitA: 15, vitC: 30, iron: 8, calcium: 10 },
  { name: 'Cabbage Sabzi', calories: 140, protein: 3, carbs: 12, fat: 8, fiber: 5, vitA: 5, vitC: 45, iron: 6, calcium: 12 },
  { name: 'Baingan Bharta', calories: 140, protein: 3, carbs: 12, fat: 9, fiber: 7, vitA: 4, vitC: 10, iron: 6, calcium: 5 },
  { name: 'Mix Veg', calories: 210, protein: 6, carbs: 18, fat: 12, fiber: 5, vitA: 25, vitC: 20, iron: 8, calcium: 8 },
  { name: 'Sarson Ka Saag', calories: 200, protein: 8, carbs: 15, fat: 14, fiber: 8, vitA: 90, vitC: 50, iron: 40, calcium: 25 },
  { name: 'Dum Aloo', calories: 260, protein: 5, carbs: 30, fat: 14, fiber: 4, vitA: 6, vitC: 15, iron: 8, calcium: 6 },
  { name: 'Lauki Sabzi', calories: 110, protein: 2, carbs: 8, fat: 7, fiber: 3, vitA: 2, vitC: 15, iron: 4, calcium: 6 },
  { name: 'Lauki Kofta', calories: 240, protein: 6, carbs: 18, fat: 16, fiber: 4, vitA: 5, vitC: 10, iron: 6, calcium: 8 },
  { name: 'Malai Kofta', calories: 450, protein: 10, carbs: 35, fat: 30, fiber: 4, vitA: 15, vitC: 5, iron: 8, calcium: 12 },

  // --- PANEER DISHES ---
  { name: 'Palak Paneer', calories: 340, protein: 18, carbs: 12, fat: 24, fiber: 6, vitA: 80, vitC: 40, iron: 30, calcium: 25 },
  { name: 'Paneer Butter Masala', calories: 400, protein: 16, carbs: 14, fat: 32, fiber: 2, vitA: 20, vitC: 15, iron: 5, calcium: 20 },
  { name: 'Matar Paneer', calories: 320, protein: 16, carbs: 20, fat: 18, fiber: 5, vitA: 25, vitC: 20, iron: 12, calcium: 18 },
  { name: 'Shahi Paneer', calories: 420, protein: 16, carbs: 18, fat: 34, fiber: 2, vitA: 22, vitC: 8, iron: 6, calcium: 24 },
  { name: 'Kadai Paneer', calories: 350, protein: 18, carbs: 15, fat: 25, fiber: 4, vitA: 20, vitC: 30, iron: 8, calcium: 22 },
  { name: 'Methi Malai Matar', calories: 360, protein: 10, carbs: 22, fat: 26, fiber: 5, vitA: 30, vitC: 15, iron: 10, calcium: 15 },
  { name: 'Paneer Bhurji', calories: 280, protein: 20, carbs: 8, fat: 20, fiber: 2, vitA: 10, vitC: 10, iron: 8, calcium: 28 },

  // --- SNACKS & STREET FOOD ---
  { name: 'Samosa (1 pc)', calories: 260, protein: 4, carbs: 24, fat: 18, fiber: 2, vitA: 2, vitC: 4, iron: 4, calcium: 2 },
  { name: 'Bread Pakora (1 pc)', calories: 300, protein: 6, carbs: 32, fat: 16, fiber: 2, vitA: 2, vitC: 0, iron: 4, calcium: 4 },
  { name: 'Onion Pakora (4 pcs)', calories: 280, protein: 5, carbs: 24, fat: 20, fiber: 3, vitA: 2, vitC: 4, iron: 4, calcium: 4 },
  { name: 'Paneer Pakora (2 pcs)', calories: 320, protein: 14, carbs: 12, fat: 24, fiber: 1, vitA: 8, vitC: 0, iron: 6, calcium: 20 },
  { name: 'Aloo Tikki (2 pcs)', calories: 300, protein: 4, carbs: 35, fat: 16, fiber: 4, vitA: 4, vitC: 10, iron: 6, calcium: 4 },
  { name: 'Vada Pav', calories: 300, protein: 8, carbs: 45, fat: 14, fiber: 3, vitA: 4, vitC: 8, iron: 10, calcium: 5 },
  { name: 'Pav Bhaji', calories: 600, protein: 15, carbs: 80, fat: 25, fiber: 10, vitA: 40, vitC: 30, iron: 20, calcium: 12 },
  { name: 'Pani Puri (6 pcs)', calories: 220, protein: 4, carbs: 32, fat: 8, fiber: 2, vitA: 4, vitC: 8, iron: 8, calcium: 4 },
  { name: 'Papdi Chaat', calories: 350, protein: 8, carbs: 45, fat: 16, fiber: 4, vitA: 8, vitC: 12, iron: 8, calcium: 15 },
  { name: 'Dahi Vada (2 pcs)', calories: 320, protein: 10, carbs: 30, fat: 14, fiber: 2, vitA: 6, vitC: 2, iron: 4, calcium: 25 },
  { name: 'Sev Puri', calories: 280, protein: 6, carbs: 40, fat: 12, fiber: 3, vitA: 5, vitC: 8, iron: 6, calcium: 4 },
  { name: 'Bhel Puri', calories: 220, protein: 6, carbs: 40, fat: 5, fiber: 4, vitA: 10, vitC: 12, iron: 15, calcium: 4 },
  { name: 'Kachori (1 pc)', calories: 280, protein: 5, carbs: 28, fat: 18, fiber: 3, vitA: 2, vitC: 2, iron: 5, calcium: 3 },
  { name: 'Mathri (2 pcs)', calories: 180, protein: 3, carbs: 22, fat: 9, fiber: 1, vitA: 0, vitC: 0, iron: 2, calcium: 1 },
  { name: 'Aloo Bhujia (30g)', calories: 180, protein: 3, carbs: 15, fat: 12, fiber: 1, vitA: 0, vitC: 0, iron: 2, calcium: 1 },
  { name: 'Roasted Peanuts (Handful)', calories: 170, protein: 7, carbs: 6, fat: 14, fiber: 3, vitA: 0, vitC: 0, iron: 6, calcium: 4 },
  { name: 'Dhokla (2 pcs)', calories: 150, protein: 6, carbs: 22, fat: 4, fiber: 2, vitA: 2, vitC: 2, iron: 6, calcium: 4 },
  { name: 'Poha', calories: 250, protein: 5, carbs: 46, fat: 8, fiber: 2, vitA: 8, vitC: 15, iron: 25, calcium: 2 },
  { name: 'Sabudana Khichdi', calories: 350, protein: 3, carbs: 60, fat: 14, fiber: 2, vitA: 2, vitC: 0, iron: 4, calcium: 4 },

  // --- SOUTH INDIAN ---
  { name: 'Idli (2 pcs)', calories: 120, protein: 4, carbs: 24, fat: 0.5, fiber: 2, vitA: 0, vitC: 0, iron: 4, calcium: 3 },
  { name: 'Dosa (Plain)', calories: 180, protein: 4, carbs: 28, fat: 6, fiber: 1, vitA: 0, vitC: 0, iron: 4, calcium: 2 },
  { name: 'Masala Dosa', calories: 350, protein: 8, carbs: 45, fat: 16, fiber: 5, vitA: 8, vitC: 6, iron: 12, calcium: 6 },
  { name: 'Rava Dosa', calories: 220, protein: 4, carbs: 32, fat: 8, fiber: 1, vitA: 2, vitC: 0, iron: 4, calcium: 2 },
  { name: 'Uttapam', calories: 240, protein: 6, carbs: 35, fat: 8, fiber: 4, vitA: 10, vitC: 15, iron: 6, calcium: 5 },
  { name: 'Vada (Medu Vada 2)', calories: 300, protein: 8, carbs: 30, fat: 18, fiber: 4, vitA: 2, vitC: 2, iron: 8, calcium: 6 },
  { name: 'Sambar (1 bowl)', calories: 160, protein: 6, carbs: 25, fat: 4, fiber: 5, vitA: 12, vitC: 15, iron: 8, calcium: 6 },
  { name: 'Rasam', calories: 60, protein: 2, carbs: 10, fat: 1, fiber: 2, vitA: 5, vitC: 20, iron: 4, calcium: 4 },
  { name: 'Upma', calories: 220, protein: 6, carbs: 35, fat: 8, fiber: 4, vitA: 5, vitC: 4, iron: 8, calcium: 3 },

  // --- SWEETS ---
  { name: 'Gulab Jamun (2 pcs)', calories: 300, protein: 4, carbs: 40, fat: 14, fiber: 0, vitA: 2, vitC: 0, iron: 2, calcium: 8 },
  { name: 'Rasgulla (2 pcs)', calories: 240, protein: 6, carbs: 50, fat: 2, fiber: 0, vitA: 2, vitC: 0, iron: 2, calcium: 12 },
  { name: 'Jalebi (4 pcs)', calories: 350, protein: 2, carbs: 60, fat: 12, fiber: 0, vitA: 0, vitC: 0, iron: 2, calcium: 2 },
  { name: 'Gajar Ka Halwa', calories: 350, protein: 6, carbs: 45, fat: 18, fiber: 4, vitA: 80, vitC: 5, iron: 6, calcium: 18 },
  { name: 'Moong Dal Halwa', calories: 400, protein: 10, carbs: 45, fat: 20, fiber: 3, vitA: 4, vitC: 0, iron: 8, calcium: 6 },
  { name: 'Rabri (1 bowl)', calories: 380, protein: 12, carbs: 30, fat: 22, fiber: 0, vitA: 15, vitC: 0, iron: 2, calcium: 40 },
  { name: 'Rasmalai (2 pcs)', calories: 320, protein: 12, carbs: 35, fat: 16, fiber: 0, vitA: 10, vitC: 0, iron: 4, calcium: 30 },
  { name: 'Kaju Katli (2 pcs)', calories: 180, protein: 4, carbs: 24, fat: 9, fiber: 1, vitA: 0, vitC: 0, iron: 3, calcium: 4 },
  { name: 'Besan Ladoo (1 pc)', calories: 180, protein: 4, carbs: 20, fat: 10, fiber: 2, vitA: 2, vitC: 0, iron: 4, calcium: 4 },
  { name: 'Milk Cake (1 pc)', calories: 220, protein: 6, carbs: 28, fat: 10, fiber: 0, vitA: 6, vitC: 0, iron: 2, calcium: 25 },
  { name: 'Soan Papdi (2 pcs)', calories: 260, protein: 2, carbs: 38, fat: 12, fiber: 1, vitA: 0, vitC: 0, iron: 2, calcium: 2 },
  { name: 'Kheer (1 bowl)', calories: 280, protein: 8, carbs: 40, fat: 10, fiber: 0, vitA: 8, vitC: 0, iron: 2, calcium: 25 },
  { name: 'Seviyan (Vermicelli)', calories: 250, protein: 6, carbs: 42, fat: 8, fiber: 1, vitA: 4, vitC: 0, iron: 3, calcium: 15 },

  // --- DRINKS ---
  { name: 'Masala Chai', calories: 120, protein: 3, carbs: 14, fat: 5, fiber: 0, vitA: 2, vitC: 0, iron: 0, calcium: 10 },
  { name: 'Filter Coffee', calories: 100, protein: 2, carbs: 12, fat: 4, fiber: 0, vitA: 2, vitC: 0, iron: 0, calcium: 8 },
  { name: 'Cold Coffee', calories: 250, protein: 6, carbs: 35, fat: 9, fiber: 0, vitA: 8, vitC: 0, iron: 2, calcium: 25 },
  { name: 'Lassi (Sweet)', calories: 250, protein: 9, carbs: 35, fat: 10, fiber: 0, vitA: 6, vitC: 2, iron: 1, calcium: 35 },
  { name: 'Mango Lassi', calories: 300, protein: 8, carbs: 45, fat: 10, fiber: 1, vitA: 20, vitC: 30, iron: 1, calcium: 30 },
  { name: 'Buttermilk (Chaas)', calories: 45, protein: 2, carbs: 3, fat: 2, fiber: 0, vitA: 2, vitC: 2, iron: 0, calcium: 10 },
  { name: 'Jaljeera', calories: 20, protein: 0.5, carbs: 5, fat: 0, fiber: 0.5, vitA: 2, vitC: 10, iron: 4, calcium: 2 },
  { name: 'Nimbu Pani', calories: 60, protein: 0, carbs: 15, fat: 0, fiber: 0, vitA: 0, vitC: 40, iron: 1, calcium: 2 },
  { name: 'Badam Milk', calories: 300, protein: 10, carbs: 25, fat: 18, fiber: 3, vitA: 10, vitC: 0, iron: 6, calcium: 40 },
  { name: 'Thandai', calories: 280, protein: 6, carbs: 35, fat: 12, fiber: 2, vitA: 8, vitC: 4, iron: 6, calcium: 20 },
];

const MEAL_TIMES = ['Morning', 'Noon', 'Afternoon', 'Evening', 'Night', 'Late Night'];

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyBFqn43hvOz8ELljdFZNBurYorKXkKI1sc",
  authDomain: "aahar-nidra.firebaseapp.com",
  projectId: "aahar-nidra",
  storageBucket: "aahar-nidra.firebasestorage.app",
  messagingSenderId: "862812230906",
  appId: "1:862812230906:web:6b3f433091bea5308fe543",
  measurementId: "G-RGT4NKE8VY"
};

// Initialize Firebase
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Init Error:", e);
}

const appId = firebaseConfig.projectId; 

// --- Gemini API Helper (Smart Fallback) ---
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env.REACT_APP_GEMINI_API_KEY) {
    return process.env.REACT_APP_GEMINI_API_KEY;
  }
  return localStorage.getItem('custom_gemini_key') || "";
};

const callGemini = async (prompt) => {
  const key = getApiKey();
  if (!key) return "Please enter your API Key in the 'About' section to use AI features.";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${key}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate response.";
  } catch (error) {
    return "Connection error. Check your API Key.";
  }
};

// --- Helper Functions ---
const getTodayStr = () => new Date().toISOString().split('T')[0];
const calculateSleepDuration = (start, end) => {
  if (!start || !end) return 0;
  let [h1, m1] = start.split(':').map(Number);
  let [h2, m2] = end.split(':').map(Number);
  let startMin = h1 * 60 + m1;
  let endMin = h2 * 60 + m2;
  if (endMin < startMin) endMin += 24 * 60; 
  return parseFloat(((endMin - startMin) / 60).toFixed(2));
};

// Auto-detect meal time based on current hour
const getCurrentMealTime = () => {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return 'Morning';
  if (h >= 11 && h < 13) return 'Noon';
  if (h >= 13 && h < 16) return 'Afternoon';
  if (h >= 16 && h < 20) return 'Evening';
  if (h >= 20 && h < 24) return 'Night';
  return 'Late Night';
};

const defaultDailyData = { sleep: { bedtime: '', waketime: '', quality: 3, duration: 0 }, food: [] };

// --- Helper: BMR & TDEE Calculator ---
const calculateRequirements = (profile) => {
  if (!profile.weight || !profile.height || !profile.age) {
    return { calories: 2000, protein: 60, carbs: 250, fat: 70 };
  }
  let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age);
  bmr += profile.gender === 'female' ? -161 : 5;
  const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  const tdee = bmr * (activityMultipliers[profile.activity] || 1.2);
  return {
    calories: Math.round(tdee),
    carbs: Math.round((tdee * 0.50) / 4),
    protein: Math.round((tdee * 0.20) / 4),
    fat: Math.round((tdee * 0.30) / 9)
  };
};

// --- Components ---
const AIModal = ({ isOpen, onClose, title, content, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[80vh]">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2"><Sparkles size={18} className="text-yellow-300" /> {title}</h3>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto text-gray-700 leading-relaxed">
          {isLoading ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <p className="text-sm text-gray-500 animate-pulse">Consulting Gemini...</p>
            </div>
          ) : (
            <div className="prose prose-sm text-sm">{content.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const MacroPieChart = ({ carbs, protein, fat, title, total }) => {
  const totalMacros = carbs + protein + fat;
  // Avoid NaN by checking totalMacros
  const cPct = totalMacros ? (carbs / totalMacros) * 100 : 33.3;
  const pPct = totalMacros ? (protein / totalMacros) * 100 : 33.3;
  const fPct = totalMacros ? (fat / totalMacros) * 100 : 33.4;

  return (
    <div className="flex flex-col items-center mb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
      <div className="relative w-32 h-32 rounded-full shadow-inner flex items-center justify-center"
           style={{
             background: `conic-gradient(
               #4ade80 0% ${cPct}%, 
               #60a5fa ${cPct}% ${cPct + pPct}%, 
               #facc15 ${cPct + pPct}% 100%
             )`
           }}>
        <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
           <span className="text-lg font-bold text-gray-800">{Math.round(total || 0)}</span>
           <span className="text-[10px] text-gray-400">kcal</span>
        </div>
      </div>
      <div className="flex gap-3 mt-3 text-xs">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400"></div>Carb</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div>Prot</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div>Fat</div>
      </div>
    </div>
  );
};

const SleepChart = ({ history }) => {
  const data = [...history].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  const chartData = data.length > 0 ? data : [];
  const maxHours = 12;
  const width = 350; const height = 200;
  const padding = { top: 40, bottom: 30, left: 35, right: 15 };
  const chartHeight = height - padding.top - padding.bottom;
  const chartWidth = width - padding.left - padding.right;
  const barWidth = 20;
  const gap = (chartWidth - (Math.max(chartData.length, 1) * barWidth)) / (Math.max(chartData.length, 1) + 1);

  if (data.length === 0) return <div className="text-gray-400 text-xs p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">No sleep data logged yet.</div>;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible font-sans">
      {[0, 4, 8, 12].map(h => {
        const y = padding.top + chartHeight - (h / maxHours) * chartHeight;
        return <g key={h}><line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4"/><text x={padding.left - 8} y={y + 3} fontSize="10" fill="#9ca3af" textAnchor="end">{h}h</text></g>;
      })}
      {chartData.map((d, i) => {
        const h = Math.min((d.sleep?.duration || 0), 12);
        const barHeight = (h / maxHours) * chartHeight;
        const x = padding.left + gap + i * (barWidth + gap);
        const y = padding.top + chartHeight - barHeight;
        return <g key={d.date}><rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 2)} fill={h >= 7 ? "#8b5cf6" : "#f87171"} rx="4"/><text x={x + barWidth/2} y={height - 10} fontSize="10" fill="#6b7280" textAnchor="middle">{d.date.slice(8)}</text></g>;
      })}
    </svg>
  );
};

const NutrientBar = ({ label, current, target, color }) => {
  const percent = Math.min(100, (current / (target || 1)) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1 text-gray-600"><span>{label}</span><span>{Math.round(current)} / {target}</span></div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden"><div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }}/></div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [logs, setLogs] = useState({});
  
  // Profile State
  const [profile, setProfile] = useState({ name: '', age: '', weight: '', height: '', gender: 'male', activity: 'sedentary' });

  // Form States
  const [sleepForm, setSleepForm] = useState({ bedtime: '23:00', waketime: '07:00', quality: 3 });
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodQuantity, setFoodQuantity] = useState(1);
  const [selectedMealTime, setSelectedMealTime] = useState(getCurrentMealTime()); 

  const [aiModal, setAiModal] = useState({ open: false, title: '', content: '', loading: false });
  const [authError, setAuthError] = useState(null);
  const [customKey, setCustomKey] = useState(localStorage.getItem('custom_gemini_key') || '');

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (!currentUser) {
          const savedLogs = localStorage.getItem('aahar_logs');
          if (savedLogs) try { setLogs(JSON.parse(savedLogs)); } catch(e){}
        }
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (!user || !db || isGuest) return;
    
    const collectionRef = collection(db, 'artifacts', appId, 'users', user.uid, 'daily_logs');
    const unsubscribeLogs = onSnapshot(collectionRef, (snapshot) => {
      const newLogs = {};
      snapshot.forEach(doc => newLogs[doc.id] = doc.data());
      setLogs(newLogs);
    });

    const loadProfile = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setProfile(docSnap.data());
      } catch(e) {}
    };
    if (!isGuest) loadProfile();

    return () => unsubscribeLogs();
  }, [user, isGuest]);

  useEffect(() => {
    if (activeTab === 'food') setSelectedMealTime(getCurrentMealTime());
  }, [activeTab]);

  const saveCustomKey = () => {
    localStorage.setItem('custom_gemini_key', customKey);
    alert("API Key Saved!");
  };

  const saveProfile = async () => {
    if (user && !isGuest && db) {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), profile);
      alert("Profile Saved!");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setAuthError(null);
      await signInWithPopup(auth, provider);
      setIsGuest(false);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    setUser({ uid: 'guest', displayName: 'Guest User', isAnonymous: true });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsGuest(false);
      setLogs({});
      setProfile({ name: '', age: '', weight: '', height: '', gender: 'male', activity: 'sedentary' });
    } catch (error) {}
  };

  const updateLogs = async (newData) => {
    const newLogs = { ...logs, [selectedDate]: newData };
    setLogs(newLogs);
    if (user && !isGuest && db) {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'daily_logs', selectedDate), newData);
      } catch(e) {}
    } else {
      localStorage.setItem('aahar_logs', JSON.stringify(newLogs));
    }
  };

  const currentLog = useMemo(() => logs[selectedDate] || defaultDailyData, [logs, selectedDate]);
  
  const dailyNutrition = useMemo(() => {
    return (currentLog.food || []).reduce((acc, item) => {
      const multiplier = item.quantity;
      const info = INDIAN_FOOD_DB.find(f => f.name === item.name);
      if (!info) return acc;
      ['calories', 'protein', 'carbs', 'fat', 'vitA', 'vitC', 'iron', 'calcium'].forEach(k => acc[k] += info[k] * multiplier);
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, vitA: 0, vitC: 0, iron: 0, calcium: 0 });
  }, [currentLog]);

  const requirements = useMemo(() => calculateRequirements(profile), [profile]);
  const historyList = useMemo(() => Object.keys(logs).map(date => ({ date, ...logs[date] })), [logs]);
  
  const foodsByTime = (currentLog.food || []).reduce((acc, item) => {
    const time = item.mealTime || 'Other';
    if (!acc[time]) acc[time] = [];
    acc[time].push(item);
    return acc;
  }, {});

  const saveSleep = async () => {
    const duration = calculateSleepDuration(sleepForm.bedtime, sleepForm.waketime);
    const newData = { ...currentLog, sleep: { ...sleepForm, duration } };
    await updateLogs(newData);
    setActiveTab('dashboard');
  };

  const addFood = async () => {
    if (!selectedFood) return;
    const newFoodItem = { 
      name: selectedFood.name, 
      quantity: foodQuantity, 
      mealTime: selectedMealTime, 
      timestamp: new Date().toISOString() 
    };
    const newData = { ...currentLog, food: [...(currentLog.food || []), newFoodItem] };
    await updateLogs(newData);
    setSelectedFood(null); setFoodQuantity(1); setFoodSearch('');
  };

  const removeFood = async (index) => {
    const newFoodList = [...(currentLog.food || [])];
    newFoodList.splice(index, 1);
    await updateLogs({ ...currentLog, food: newFoodList });
  };

  const handleSleepAnalysis = async () => {
    setAiModal({ open: true, title: 'Sleep Coach', content: '', loading: true });
    const sleepData = historyList.slice(-7).map(h => ({ date: h.date, hours: h.sleep?.duration, quality: h.sleep?.quality }));
    const prompt = `You are a sleep expert. Analyze this sleep data: ${JSON.stringify(sleepData)}. Provide 3 specific, encouraging tips.`;
    const advice = await callGemini(prompt);
    setAiModal({ open: true, title: 'Sleep Coach', content: advice, loading: false });
  };

  const handleFoodSuggestion = async () => {
    setAiModal({ open: true, title: 'Meal Suggestion', content: '', loading: true });
    const prompt = `You are an Indian nutritionist. I have eaten: ${(currentLog.food||[]).map(f=>f.name).join(',')}. My totals: ${Math.round(dailyNutrition.calories)}kcal. Suggest ONE healthy Indian snack to balance my nutrition.`;
    const suggestion = await callGemini(prompt);
    setAiModal({ open: true, title: 'Meal Suggestion', content: suggestion, loading: false });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-indigo-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
           <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"><Activity size={40} /></div>
           <h1 className="text-2xl font-bold text-gray-800 mb-2">Aahar & Nidra</h1>
           <p className="text-sm text-gray-500 mb-8">Track your Indian diet and sleep patterns seamlessly.</p>
           {authError && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 text-left">{authError}</div>}
           <button onClick={handleGoogleLogin} className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm mb-3"><span className="font-bold text-blue-500">G</span> Continue with Google</button>
           <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or</span></div></div>
           <button onClick={handleGuestLogin} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"><WifiOff size={18} /> Try Offline (Guest)</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col">
      <AIModal isOpen={aiModal.open} title={aiModal.title} content={aiModal.content} isLoading={aiModal.loading} onClose={() => setAiModal({ ...aiModal, open: false })} />

      <header className="bg-indigo-600 text-white p-6 pb-12 rounded-b-[30px] shadow-lg relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity size={24} /> Aahar & Nidra <span className="text-xs bg-indigo-800 px-1 rounded">v7.0</span></h1>
          <div className="flex items-center gap-2">
             {user.photoURL ? <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border-2 border-white/50" /> : <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center"><User size={16}/></div>}
             <button onClick={handleLogout} className="text-xs bg-indigo-500 hover:bg-indigo-400 p-2 rounded-lg"><LogOut size={16} /></button>
          </div>
        </div>
        <div className="flex items-center justify-between bg-indigo-500/50 rounded-lg p-2">
          <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]); }} className="p-1 hover:bg-indigo-400 rounded"><ChevronLeft size={20} /></button>
          <span className="font-medium">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} {selectedDate === getTodayStr() && " (Today)"}</span>
          <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]); }} className="p-1 hover:bg-indigo-400 rounded"><ChevronRight size={20} /></button>
        </div>
        {isGuest && <div className="absolute top-full left-0 w-full bg-orange-100 text-orange-800 text-xs py-1 text-center z-0">Guest Mode</div>}
      </header>

      <main className="flex-1 overflow-y-auto p-4 -mt-6 relative z-20 pb-24">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* --- TODAY'S FOOD TIMELINE --- */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Clock size={18}/> Today's Meals</h3>
               {(currentLog.food || []).length === 0 ? (
                 <div className="text-center py-8 text-gray-400 text-sm">No meals logged today.</div> 
               ) : (
                 <div className="space-y-6">
                   {MEAL_TIMES.map(time => {
                     const items = foodsByTime[time];
                     if (!items) return null;
                     return (
                       <div key={time}>
                         <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider border-b border-gray-100 pb-1">{time}</h4>
                         <div className="space-y-2">
                           {items.map((item, idx) => {
                             const info = INDIAN_FOOD_DB.find(f => f.name === item.name);
                             const cals = info ? info.calories * item.quantity : 0;
                             const originalIdx = (currentLog.food || []).findIndex(f => f === item);
                             return (
                               <div key={idx} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                                 <div>
                                   <div className="font-medium text-gray-800 text-sm">{item.name}</div>
                                   <div className="text-[10px] text-gray-500">x{item.quantity} • {cals} kcal</div>
                                 </div>
                                 <button onClick={() => removeFood(originalIdx)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     )
                   })}
                 </div>
               )}
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3"><h3 className="font-semibold text-gray-700 flex items-center gap-2"><Moon size={18} className="text-indigo-500" /> Sleep Summary</h3><button onClick={() => setActiveTab('sleep')} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-medium">Edit</button></div>
              {currentLog.sleep?.duration > 0 ? <div className="flex items-end gap-4"><div><span className="text-4xl font-bold text-indigo-600">{currentLog.sleep.duration}</span><span className="text-gray-500 ml-1">hrs</span></div><div className="text-sm text-gray-500 mb-1 flex-1">Quality: {currentLog.sleep.quality}/5</div></div> : <div className="text-gray-400 text-sm text-center py-4">No sleep logged</div>}
            </div>
          </div>
        )}

        {activeTab === 'sleep' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ChevronLeft onClick={() => setActiveTab('dashboard')} className="cursor-pointer text-gray-400"/> Log Sleep</h2>
            <div className="space-y-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Bedtime</label><input type="time" value={sleepForm.bedtime} onChange={(e) => setSleepForm({...sleepForm, bedtime: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Wake Time</label><input type="time" value={sleepForm.waketime} onChange={(e) => setSleepForm({...sleepForm, waketime: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-3">Quality (1-5)</label><div className="flex justify-between">{[1, 2, 3, 4, 5].map(q => (<button key={q} onClick={() => setSleepForm({...sleepForm, quality: q})} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-colors ${sleepForm.quality === q ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{q}</button>))}</div></div>
              <button onClick={saveSleep} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg mt-4">Save Sleep Log</button>
            </div>
          </div>
        )}

        {activeTab === 'food' && (
          <div className="space-y-4 h-full flex flex-col">
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4"><ChevronLeft onClick={() => setActiveTab('dashboard')} className="cursor-pointer text-gray-400"/><h2 className="text-xl font-bold">Add Food</h2></div>
              <div className="mb-4"><div className="text-xs text-gray-500 mb-2 font-medium ml-1">SELECT TIME SLOT</div><div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">{MEAL_TIMES.map(time => (<button key={time} onClick={() => setSelectedMealTime(time)} className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedMealTime === time ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{time}</button>))}</div></div>
              <div className="relative mb-4"><input type="text" placeholder="Search food..." value={foodSearch} onChange={(e) => setFoodSearch(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl pl-10"/><Search className="absolute left-3 top-3.5 text-gray-400" size={18} /></div>
              {foodSearch && <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl mb-4">{INDIAN_FOOD_DB.filter(f => f.name.toLowerCase().includes(foodSearch.toLowerCase())).map(food => (<button key={food.name} onClick={() => { setSelectedFood(food); setFoodSearch(''); }} className="w-full text-left p-3 hover:bg-orange-50 border-b border-gray-50 last:border-0 transition-colors"><div className="font-medium text-gray-800">{food.name}</div><div className="text-xs text-gray-500">{food.calories} kcal</div></button>))}</div>}
              {selectedFood && <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4 animate-fade-in"><div className="flex justify-between items-start mb-3"><div><h4 className="font-bold text-orange-900">{selectedFood.name}</h4><div className="text-xs text-orange-700">{selectedFood.calories} kcal</div></div><button onClick={() => setSelectedFood(null)} className="text-orange-400 hover:text-orange-600"><Trash2 size={16} /></button></div><div className="flex items-center gap-3 mb-3"><button onClick={() => setFoodQuantity(Math.max(0.5, foodQuantity - 0.5))} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm font-bold">-</button><span className="font-medium text-lg w-12 text-center">{foodQuantity}</span><button onClick={() => setFoodQuantity(foodQuantity + 0.5)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm font-bold">+</button></div><button onClick={addFood} className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold shadow hover:bg-orange-600 transition-colors">Add to Log</button></div>}
              <button onClick={handleFoodSuggestion} className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white p-3 rounded-xl shadow flex items-center justify-center gap-2 text-sm font-medium hover:opacity-90 transition-opacity"><Sparkles size={16} className="text-yellow-200" /> Suggest Next Meal (AI)</button>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-4">
             {/* --- PIE CHARTS SECTION --- */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
               <h2 className="font-bold text-lg mb-4 text-gray-800">Nutrition Comparison</h2>
               
               <div className="grid grid-cols-2 gap-4">
                 {/* CHART 1: TARGET */}
                 <MacroPieChart 
                   title="Target (Daily)"
                   carbs={requirements.carbs * 4}
                   protein={requirements.protein * 4}
                   fat={requirements.fat * 9}
                   total={requirements.calories}
                 />
                 
                 {/* CHART 2: ACTUAL */}
                 <MacroPieChart 
                   title="Consumed Today"
                   carbs={dailyNutrition.carbs * 4}
                   protein={dailyNutrition.protein * 4}
                   fat={dailyNutrition.fat * 9}
                   total={dailyNutrition.calories}
                 />
               </div>

               <div className="mt-4 space-y-2">
                  <div className="text-xs text-gray-500 text-center">Based on your profile settings.</div>
                  <NutrientBar label={`Carbs (${Math.round(dailyNutrition.carbs)}/${requirements.carbs}g)`} current={dailyNutrition.carbs} target={requirements.carbs} color="bg-green-500" />
                  <NutrientBar label={`Protein (${Math.round(dailyNutrition.protein)}/${requirements.protein}g)`} current={dailyNutrition.protein} target={requirements.protein} color="bg-blue-500" />
                  <NutrientBar label={`Fat (${Math.round(dailyNutrition.fat)}/${requirements.fat}g)`} current={dailyNutrition.fat} target={requirements.fat} color="bg-yellow-500" />
               </div>
             </div>

             {/* --- VITAMINS --- */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
               <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2"><Droplet size={18} className="text-teal-500"/> Micronutrients</h2>
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-teal-50 rounded-xl">
                   <div className="text-xs text-teal-600 font-bold mb-1">Vitamin A</div>
                   <div className="text-lg font-bold text-teal-800">{Math.round(dailyNutrition.vitA)}%</div>
                 </div>
                 <div className="p-3 bg-orange-50 rounded-xl">
                   <div className="text-xs text-orange-600 font-bold mb-1">Vitamin C</div>
                   <div className="text-lg font-bold text-orange-800">{Math.round(dailyNutrition.vitC)}%</div>
                 </div>
                 <div className="p-3 bg-red-50 rounded-xl">
                   <div className="text-xs text-red-600 font-bold mb-1">Iron</div>
                   <div className="text-lg font-bold text-red-800">{Math.round(dailyNutrition.iron)}%</div>
                 </div>
                 <div className="p-3 bg-blue-50 rounded-xl">
                   <div className="text-xs text-blue-600 font-bold mb-1">Calcium</div>
                   <div className="text-lg font-bold text-blue-800">{Math.round(dailyNutrition.calcium)}%</div>
                 </div>
               </div>
             </div>

             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg text-gray-800">7-Day Sleep Trend</h2><button onClick={handleSleepAnalysis} className="text-xs bg-violet-100 text-violet-700 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-violet-200 transition-colors"><Sparkles size={12} /> Ask Guru</button></div>
               <SleepChart history={historyList} />
             </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full overflow-y-auto">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings size={24} className="text-indigo-500" /> User Profile</h2>
             
             <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full p-2 border rounded-lg mt-1" placeholder="Your Name"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Age</label>
                    <input type="number" value={profile.age} onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})} className="w-full p-2 border rounded-lg mt-1" placeholder="Years"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Gender</label>
                    <select value={profile.gender} onChange={(e) => setProfile({...profile, gender: e.target.value})} className="w-full p-2 border rounded-lg mt-1 bg-white">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Weight (kg)</label>
                    <input type="number" value={profile.weight} onChange={(e) => setProfile({...profile, weight: parseInt(e.target.value)})} className="w-full p-2 border rounded-lg mt-1" placeholder="kg"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Height (cm)</label>
                    <input type="number" value={profile.height} onChange={(e) => setProfile({...profile, height: parseInt(e.target.value)})} className="w-full p-2 border rounded-lg mt-1" placeholder="cm"/>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Activity Level</label>
                  <select value={profile.activity} onChange={(e) => setProfile({...profile, activity: e.target.value})} className="w-full p-2 border rounded-lg mt-1 bg-white">
                    <option value="sedentary">Sedentary (Little/No exercise)</option>
                    <option value="light">Light (Exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                    <option value="active">Active (Daily exercise)</option>
                  </select>
                </div>
                
                <div className="bg-indigo-50 p-3 rounded-lg mt-2 text-xs text-indigo-700">
                  Target: <b>{requirements.calories} kcal</b> (BMR: {Math.round(requirements.calories / (profile.activity === 'sedentary' ? 1.2 : 1.5))})
                </div>

                <button onClick={saveProfile} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold">Save Profile</button>
             </div>

             <h2 className="text-lg font-bold mb-2 flex items-center gap-2"><Key size={20} /> AI Key</h2>
             <div className="flex gap-2 mb-8">
                <input type="text" value={customKey} onChange={(e) => setCustomKey(e.target.value)} placeholder="Paste AIza... Key" className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"/>
                <button onClick={saveCustomKey} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">Save</button>
             </div>

             <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-red-100"><LogOut size={18}/> Sign Out</button>
          </div>
        )}
      </main>

      <nav className="bg-white border-t border-gray-200 p-2 pb-4 fixed bottom-0 w-full max-w-md z-50 flex justify-around">
        <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}><Activity size={24} /><span className="text-[10px] font-medium">Overview</span></button>
        <button onClick={() => setActiveTab('sleep')} className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${activeTab === 'sleep' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}><Moon size={24} /><span className="text-[10px] font-medium">Sleep</span></button>
        <button onClick={() => setActiveTab('food')} className={`relative p-2 -mt-6 bg-orange-500 text-white rounded-full shadow-lg border-4 border-gray-50 flex flex-col items-center justify-center w-14 h-14 hover:bg-orange-600 transition-transform active:scale-95`}><Plus size={28} /></button>
        <button onClick={() => setActiveTab('analysis')} className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${activeTab === 'analysis' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}><PieChart size={24} /><span className="text-[10px] font-medium">Analysis</span></button>
        <button onClick={() => setActiveTab('about')} className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${activeTab === 'about' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}><Settings size={24} /><span className="text-[10px] font-medium">About</span></button>
      </nav>
    </div>
  );
}
