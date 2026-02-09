import api from './api';

export interface Notice {
  id: string;
  title: string;
  body: string;
  priority?: "low" | "medium" | "high" | "emergency";
  date: Date;
}

export const subscribeToNotices = (
  callback: (notices: Notice[]) => void
) => {
  const fetch = async () => {
    try {
      const response = await api.get('/notices');
      const notices = response.data.map((n: any) => ({
        id: n.id.toString(),
        title: n.title,
        body: n.content,
        priority: n.priority,
        date: new Date(n.created_at)
      }));
      callback(notices);
    } catch (error) {
      console.error("Error fetching notices:", error);
      callback([]);
    }
  };
  fetch();
  const interval = setInterval(fetch, 30000);
  return () => clearInterval(interval);
};

export const createNotice = async (notice: {
  title: string;
  body: string;
  priority?: Notice["priority"];
  date?: Date;
}) => {
  try {
    await api.post('/notices', {
      title: notice.title,
      content: notice.body,
      priority: notice.priority
    });
  } catch (error) {
    console.error("Error creating notice:", error);
    throw error;
  }
};

export const updateNotice = async (
  id: string,
  updates: Partial<Omit<Notice, "id">>
) => {
  // TODO: Implement update endpoint in backend if needed
  console.warn("updateNotice API not implemented in backend yet");
};

export const deleteNotice = async (id: string) => {
  try {
    await api.delete(`/notices/${id}`);
  } catch (error) {
    console.error("Error deleting notice:", error);
    throw error;
  }
};
