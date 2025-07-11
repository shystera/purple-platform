
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve('.'),
        }
      },
      build: {
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html'),
            indexOne: path.resolve(__dirname, 'index-1.html'),
            buildCourse: path.resolve(__dirname, 'build-course.html'),
            coachAdminPanel: path.resolve(__dirname, 'coach-admin-panel.html'),
            courseDetail: path.resolve(__dirname, 'course-detail.html'),
            createCourse: path.resolve(__dirname, 'create-course.html'),
            editCourse: path.resolve(__dirname, 'edit-course.html'),
            lessonPlayer: path.resolve(__dirname, 'lesson-player.html'),
            login: path.resolve(__dirname, 'login.html'),
            role: path.resolve(__dirname, 'role.html'),
            signup: path.resolve(__dirname, 'signup.html'),
            studentPanel: path.resolve(__dirname, 'student-panel.html'),
            video: path.resolve(__dirname, 'video.html'),
          }
        }
      }
    };
});
