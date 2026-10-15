"""QA Atlas — laboratório SQLite em memória. Execute: py lab_sql.py
Requer somente Python 3. Não cria ou sobrescreve arquivos.
Dados fictícios e valores em centavos. Você pode editar as consultas abaixo.
"""
import sqlite3

def main():
    with sqlite3.connect(':memory:') as db:
        db.execute('PRAGMA foreign_keys=ON')
        db.executescript('''
        CREATE TABLE usuarios(id INTEGER PRIMARY KEY, nome TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL, ativo INTEGER CHECK(ativo IN (0,1)) NOT NULL);
        CREATE TABLE pedidos(id INTEGER PRIMARY KEY, usuario_id INTEGER NOT NULL
          REFERENCES usuarios(id), valor_centavos INTEGER NOT NULL CHECK(valor_centavos>=0));
        INSERT INTO usuarios VALUES(1,'Ana','ana@example.test',1),
          (2,'Bia','bia@example.test',0),(3,'Caio','caio@example.test',1);
        INSERT INTO pedidos VALUES(1,1,2000),(2,1,4000),(3,2,1500);
        ''')
        ativos=db.execute('SELECT nome FROM usuarios WHERE ativo=1 ORDER BY nome').fetchall()
        totais=db.execute('SELECT usuario_id, COUNT(*), SUM(valor_centavos) FROM pedidos GROUP BY usuario_id ORDER BY usuario_id').fetchall()
        sem_pedidos=db.execute('SELECT u.nome FROM usuarios u LEFT JOIN pedidos p ON p.usuario_id=u.id WHERE p.id IS NULL').fetchall()
        assert ativos==[('Ana',),('Caio',)]
        assert totais==[(1,2,6000),(2,1,1500)]
        assert sem_pedidos==[('Caio',)]
        db.execute('BEGIN')
        db.execute('UPDATE pedidos SET valor_centavos=1 WHERE id=1')
        db.rollback()
        assert db.execute('SELECT valor_centavos FROM pedidos WHERE id=1').fetchone()==(2000,)
        assert db.execute('SELECT COUNT(*),SUM(valor_centavos) FROM pedidos').fetchone()==(3,7500)
        print('5 verificações passaram. Ativos:',ativos,'Totais:',totais,'Sem pedidos:',sem_pedidos)
if __name__=='__main__':main()
