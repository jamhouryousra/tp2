const request = require('supertest');
const app = require('../src/app');

// Mock the pg pool
jest.mock('../src/db', () => {
  const mockQuery = jest.fn();
  return {
    pool: { query: mockQuery },
    initDB: jest.fn(),
  };
});

const { pool } = require('../src/db');

describe('Task Manager API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return ok status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', description: 'Desc 1', status: 'pending' },
        { id: 2, title: 'Task 2', description: 'Desc 2', status: 'done' },
      ];
      pool.query.mockResolvedValue({ rows: mockTasks });

      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockTasks);
    });

    it('should return 500 on database error', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = { id: 1, title: 'New Task', description: 'Test', status: 'pending' };
      pool.query.mockResolvedValue({ rows: [newTask] });

      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'New Task', description: 'Test' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('New Task');
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const updated = { id: 1, title: 'Updated', description: 'Desc', status: 'done' };
      pool.query.mockResolvedValue({ rows: [updated] });

      const res = await request(app)
        .put('/api/tasks/1')
        .send({ status: 'done' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('done');
    });

    it('should return 404 if task not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .put('/api/tasks/999')
        .send({ title: 'Nope' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const res = await request(app).delete('/api/tasks/1');
      expect(res.status).toBe(200);
    });

    it('should return 404 if task not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app).delete('/api/tasks/999');
      expect(res.status).toBe(404);
    });
  });
});
