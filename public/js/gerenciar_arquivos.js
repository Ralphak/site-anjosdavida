var selectAlunos = divPagina.getElementsByTagName("select")[0],
    listaArquivos = divPagina.getElementsByTagName("ul")[0],
    formArquivos = divPagina.getElementsByTagName("form")[0],
    listaEnvio = divPagina.getElementsByTagName("ul")[1],
    botaoApagar = document.getElementById("botao-apagar");

validarCategoria("admin").then(()=>{
    //criar lista de alunos
    selectAlunos.innerHTML = "<option disabled>- Escolha um aluno</option>";
    Object.keys(listaAlunos).forEach(id=>{
        selectAlunos.innerHTML += `<option value="${id}">${listaAlunos[id].nome}</option>`;
    });
    tinysort(selectAlunos);
    selectAlunos.selectedIndex = 0;
});

//Listar os arquivos do aluno escolhido
selectAlunos.addEventListener("change", ()=>{
    formArquivos.setAttribute("hidden","");
    listaArquivos.innerHTML = "Por favor aguarde...";
    storageRef.child(`arquivos/${selectAlunos.value}`).listAll().then(lista=>{
        if(lista.items.length == 0){
            listaArquivos.innerHTML = "Nenhum arquivo!";
        } else{
            listaArquivos.innerHTML = "";
            lista.items.forEach(arquivo=>{
                storageRef.child(arquivo.fullPath).getDownloadURL().then(downloadURL =>{
                    listaArquivos.innerHTML += `<li>
                        <a href="${downloadURL}" target="_blank">${arquivo.name}</a> - 
                        <a href="" class="apagar-arquivo" id="${arquivo.fullPath}">Apagar</a>
                    </li>`;
                    //mostra um modal ao clicar em apagar
                    document.querySelectorAll(".apagar-arquivo").forEach(link=>{
                        link.addEventListener("click", e=>{
                            e.preventDefault();
                            divPagina.querySelector(".modal-body").innerHTML = `Apagar o arquivo ${e.target.id.split("/").pop()}?`;
                            botaoApagar.dataset.path = e.target.id;
                            $("#confirmar-remocao-arquivo").modal();
                        });
                    });
                });
            });
        }
        formArquivos.removeAttribute("hidden");
    });
});

//Apagar o arquivo após confirmação
botaoApagar.addEventListener("click", ()=>{
    storageRef.child(botaoApagar.dataset.path).delete();
    document.getElementById(botaoApagar.dataset.path).parentElement.remove();
    if(listaArquivos.innerHTML == ""){
        listaArquivos.innerHTML = "Nenhum arquivo!";
    }
});

//Exibe os nomes dos arquivos a serem enviados
divPagina.getElementsByTagName("input")[0].addEventListener("change", e=>{
    listaEnvio.innerHTML = "";
    if(e.target.files.length > 1){
        Object.values(e.target.files).forEach(arquivo=>{
            listaEnvio.innerHTML += `<li class="list-inline-item">${arquivo.name}</li>`;
        });
    }
});

//Envio dos arquivos ao armazenamento
formArquivos.addEventListener("submit", e=>{
    e.preventDefault();
    Object.values(e.target[0].files).forEach(arquivo=>{
        storageRef.child(`arquivos/${selectAlunos.value}/${arquivo.name}`).put(arquivo);
    });
    paginaSucesso("Envio de arquivos realizado!", "gerenciar_arquivos");
});