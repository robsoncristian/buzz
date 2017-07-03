import { create } from 'rung-sdk';
import { Char, OneOf } from 'rung-sdk/dist/types';
import Bluebird from 'bluebird';
import agent from 'superagent';
import promisifyAgent from 'superagent-promise';
import { map, mergeAll } from 'ramda';

const request = promisifyAgent(agent, Bluebird);

const newsApiUrl = 'https://api.cognitive.microsoft.com/bing/v5.0/news/search';
const newsApiToken = '<<token>>';

const styles = {
  container: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: '12px',
      marginTop: '-3px'
  }
};

function getContent(newsTitle) {
  return (
      <div style={ styles.container }>
        <p><b>Notícia</b></p>
        <p>{newsTitle}</p>
      </div>
  );
}

function render(value) {

  const newsTitle = value.name;
  const newsUrl = value.url;

  return { [newsUrl] : {
    title: `Notícia - ${newsTitle}`,
    content: getContent(newsTitle),
    comment: 
      `
      ## Notícia
      ### [${newsTitle}](${newsUrl})
      `
  }};
}

function main(context,done) {
  const { brand } = context.params;

  return request
    .get(newsApiUrl)
    .set('Ocp-Apim-Subscription-Key', newsApiToken)
    .set('Accept', 'application/json')
    .query({q:brand,mkt:'pt-BR',count:10,setLang:'pt',originalImg:'true'})
    .then(({ body }) => {
      const alerts = mergeAll(map(render, body.value));
      done({ alerts });
    })
    .catch(() => {
      done({ alerts: {} })
    });
}

const params = {
  brand: {
      description: _('Qual é a marca que você deseja monitorar?'),
      type: Char(100),
      required: true
  }
};

export default create(main, { 
  params,
  primaryKey: true,
  title:'Buzz',
  description:'As notícias que saem sobre sua marca',
  preview: getContent("O Rung foi lançado nos EUA")
});