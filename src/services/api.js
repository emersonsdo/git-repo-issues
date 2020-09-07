import axios from 'axios';

const apiGit = axios.create({
  baseURL: 'https://api.github.com/',
});

export default apiGit;
