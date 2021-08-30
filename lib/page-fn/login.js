async function login({selectors, env}){
  document.querySelector("input#username").value = env.USERNAME;
  document.querySelector("input#password").value = env.PASSWORD;

  const encrypted = window.encrypt();
  document.querySelector("#encrypted").value = encrypted;

  document.querySelector("#form-login").submit();
}

export default login
