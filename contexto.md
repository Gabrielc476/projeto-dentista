Projeto para controle e agendamento de pacientes para um consultorio de dentista

usuario principal - Recepcionista e Dentista

Requisitos para MVP
Banco de dados funcional
Agendamento de consultas
Controle de consultas
Controle de pacientes
Cadastro de pacientes
Controle de pagamentos realizados e pendentes, relacionado a consulta e paciente
Cadastro e Edição de Procedimento podendo ser relacionado com a consulta


Especificações de Infra e Arquitetura

Dividido entre Frontend e Backend

Frontend

Nextjs 16, shadcn, padrão atomico com pasta ui do shadcn servindo como atomos
Hooks para controle de logica
Arquivo api.ts para base de chamadas para API
Services seguindo principio de SOLID para controle de chamadas para API

Backend
Nestjs, refatorado para arquitetura limpa, deve ser separado em domain com abstração total
Application com use cases e dtos de input
Infra com implementação de banco de dados e implementação do nestjs
Utilização do padrão injectable, provider e module do nestjs
Presentation com controllers e dtos de resposta
No momento sem autenticação

Banco de dados
Supabase, procurar a implementação mais simples possivel, utilizar cliente do supabase apenas no backend, frontend não pode ter acesso ao supabase.

Guia de tratamento de erros
Sempre que houver um erro, o primeiro passo é sempre adicionar logs para diagnostico e não tentar achar soluções antes de ter uma imagem clara

Referencias para design
Olhar a imagem no arquivo com nome referencia.png


Ideia de funcionamento
Modal de cadastro de paciente normal
No modal de consulta deve poder ser selecionado um ou mais procedimentos, o paciente e ter a opção de colocar o valor manualmente ou calcular o valor baseado no procedimento
No modal de pagamento deve ter a opção de selecionar o pagamento, o valor e o tipo de pagamento

