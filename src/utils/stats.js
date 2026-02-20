export const calculateAccuracy = (correct, attempted) => {
    if (!attempted || attempted === 0) return 0;
    return Math.round((correct / attempted) * 100);
};

export const getSubjectStats = (sessions) => {
    const stats = {};
    sessions.forEach(s => {
        if (!stats[s.subject]) {
            stats[s.subject] = { attempted: 0, correct: 0, wrong: 0 };
        }
        stats[s.subject].attempted += Number(s.attempted);
        stats[s.subject].correct += Number(s.correct);
        stats[s.subject].wrong += Number(s.wrong);
    });

    return Object.keys(stats).map(subject => ({
        subject,
        ...stats[subject],
        accuracy: calculateAccuracy(stats[subject].correct, stats[subject].attempted)
    }));
};

export const getTopicStats = (sessions) => {
    const stats = {};
    sessions.forEach(s => {
        const key = `${s.subject}:${s.topic}`;
        if (!stats[key]) {
            stats[key] = { subject: s.subject, topic: s.topic, attempted: 0, correct: 0, wrong: 0 };
        }
        stats[key].attempted += Number(s.attempted);
        stats[key].correct += Number(s.correct);
        stats[key].wrong += Number(s.wrong);
    });

    return Object.values(stats).map(item => ({
        ...item,
        accuracy: calculateAccuracy(item.correct, item.attempted)
    })).sort((a, b) => a.accuracy - b.accuracy);
};

export const getMockTrends = (mocks) => {
    return [...mocks].sort((a, b) => new Date(a.date) - new Date(b.date));
};
