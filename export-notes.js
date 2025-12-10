// Run this in your browser console to export notes
const notes = JSON.parse(localStorage.getItem('demodesk_notes') || '[]');
console.log(JSON.stringify(notes, null, 2));
