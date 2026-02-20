import { addEntry, STORAGE_KEYS } from "./storage";

export async function seedDatabase() {
    if (!confirm("⚠️ WARNING: This will add 100+ items to your database. Continue?")) return;

    const subjects = ["Maths", "English", "GS"];
    const topics = ["Algebra", "Geometry", "Trigonometry", "Ancient History", "Polity", "Geography", "Vocab", "Grammar"];
    const errors = ["Concept Error", "Careless Mistake", "Time Pressure", "Guess Error"];

    console.log("Starting seed process...");

    // Seed Practice Sessions (100 items)
    const practicePromises = [];
    for (let i = 0; i < 100; i++) {
        const attempted = Math.floor(Math.random() * 20) + 10;
        const correct = Math.floor(Math.random() * attempted);
        const wrong = attempted - correct;

        // 30% chance of having error tags
        const sessionErrors = [];
        if (Math.random() > 0.7) {
            sessionErrors.push(errors[Math.floor(Math.random() * errors.length)]);
        }

        practicePromises.push(addEntry(STORAGE_KEYS.PRACTICE, {
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            topic: topics[Math.floor(Math.random() * topics.length)],
            attempted,
            correct,
            wrong,
            source: "Seed Data",
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            errors: sessionErrors
        }));
    }

    // Seed Mocks (10 items)
    const mockPromises = [];
    for (let i = 0; i < 10; i++) {
        const english = Math.floor(Math.random() * 60) + 20;
        const gs = Math.floor(Math.random() * 50) + 10;
        const maths = Math.floor(Math.random() * 70) + 20;

        mockPromises.push(addEntry(STORAGE_KEYS.MOCKS, {
            name: `Mock ${i + 1}`,
            date: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            english,
            gs,
            maths,
            total: english + gs + maths
        }));
    }

    await Promise.all([...practicePromises, ...mockPromises]);

    alert("Database seeded successfully! Reloading...");
    location.reload();
}
