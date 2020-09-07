import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
// import { useAlert } from 'react-alert';

import apiGit from '../../services/api';
import { Form, SubmitButton, List } from './styles';
import Container from '../../components/Container';

function Main() {
  // const alert = useAlert();
  const [newRepo, setNewRepo] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [repoDoesNotExist, setRepoDoesNotExist] = useState(false);

  useEffect(() => {
    const storedRepositories = localStorage.getItem('repositories');

    if (storedRepositories !== '[]') {
      setRepositories(JSON.parse(storedRepositories));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('repositories', JSON.stringify(repositories));
  }, [repositories]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const storedRepositories = localStorage.getItem('repositories');
      if (storedRepositories.includes(newRepo)) {
        throw new Error('Repositório duplicado!');
      }
      const response = await apiGit.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
        owner: response.data.owner,
      };

      setRepositories([...repositories, data]);
      setNewRepo('');
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setRepoDoesNotExist(true);
        }
      } else {
        alert(error);
        // alert.show(error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <h1>
        <FaGithubAlt />
        Repositórios
      </h1>

      <Form onSubmit={handleSubmit} repoDoesNotExist={repoDoesNotExist}>
        <input
          type="text"
          placeholder="Adicionar repositório"
          value={newRepo}
          onChange={(e) => {
            setNewRepo(e.target.value);
            setRepoDoesNotExist(false);
          }}
        />

        <SubmitButton loading={loading}>
          {loading ? (
            <FaSpinner color="#FFF" size={14} />
          ) : (
            <FaPlus color="#FFF" size={14} />
          )}
        </SubmitButton>
      </Form>

      <List>
        {repositories.map((repository) => (
          <li key={repository.name}>
            <span>{repository.name}</span>
            <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
              Detalhes
            </Link>
          </li>
        ))}
      </List>
    </Container>
  );
}

export default Main;
