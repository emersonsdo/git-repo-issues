import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import apiGit from '../../services/api';
import { Owner, Loading, IssueList, IssueFilter, PageActions } from './styles';
import Container from '../../components/Container';

// props.match
function Repository({ match }) {
  const [repository, setRepository] = useState('');
  const [issues, setIssue] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [filters] = useState([
    { state: 'all', label: 'Todas' },
    { state: 'open', label: 'Abertas' },
    { state: 'closed', label: 'Fechadas' },
  ]);
  const [filterIndex, setFilterIndex] = useState(0);
  const [page, setPage] = useState(1);

  /** TODO: Separar uma função (outro useEfect) para fazer os loads das issues */
  /** pois os repositórios também estão sendo carregados novamente sem necessidade */
  useEffect(() => {
    async function loadData() {
      const repoName = decodeURIComponent(match.params.repository);
      const [repo, iss] = await Promise.all([
        apiGit.get(`/repos/${repoName}`),
        apiGit.get(`/repos/${repoName}/issues`, {
          params: {
            state: filters[filterIndex].state,
            per_page: 5,
            page,
          },
        }),
      ]);
      setRepository(repo.data);
      setIssue(iss.data);
    }

    // setLoading(true);
    loadData();
    // setLoading(false);
  }, [match.params.repository, filterIndex, filters, page]);

  function handleFilterClick(index) {
    setFilterIndex(index);
    setPage(1);
  }

  return (
    // Porque com o loading não funciona? mesmo saindo do useEffect, e com o loading
    // com valor falso, ainda demora um pouco até que os valores sejam preenchidos
    // em repository, e ao renderizar dá erro? É preciso esperar mais, então mudei a
    // condição. TODO: Pesquisar!
    <>
      {repository ? (
        <Container>
          <Owner>
            <Link to="/">Voltar aos repositórios</Link>
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
            />
            <h1>{repository.name}</h1>
            <p>{repository.description}</p>
          </Owner>

          <IssueList>
            <IssueFilter indexActive={filterIndex}>
              {filters.map((filter, index) => (
                <button
                  type="button"
                  key={filter.label}
                  onClick={() => handleFilterClick(index)}
                >
                  {filter.label}
                </button>
              ))}
            </IssueFilter>
            {issues.map((issue) => (
              // {Melhore transformar em string?
              <li key={String(issue.id)}>
                <img src={issue.user.avatar_url} alt={issue.user.login} />
                <div>
                  <strong>
                    <a href={issue.html_url}>{issue.title}</a>
                    {issue.labels.map((label) => (
                      <span key={String(label.id)}>{label.name}</span>
                    ))}
                  </strong>
                  <p>{issue.user.login}</p>
                </div>
              </li>
            ))}
          </IssueList>
          <PageActions>
            <button
              type="button"
              disabled={page < 2}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </button>
            <span>Página {page}</span>
            <button type="button" onClick={() => setPage(page + 1)}>
              Próximo
            </button>
          </PageActions>
        </Container>
      ) : (
        <Loading>Carregando...</Loading>
      )}
    </>
  );
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};

export default Repository;
