﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;


namespace AccountApplication.Dal
{
    public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : class
    {
        protected DbContext context;
        protected DbSet<TEntity> dbSet;

        public GenericRepository(DbContext context)
        {
            this.context = context;
            this.dbSet = context.Set<TEntity>();
        }

        public virtual IEnumerable<TEntity> Get(
            Expression<Func<TEntity, bool>> filter = null,
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null,int? take = null, int? skip = null,
            string includeProperties = "")
        {
            
            return GetQuery(filter, orderBy, take, skip, includeProperties).ToList();
        }

        public virtual IQueryable<TEntity> GetQuery(Expression<Func<TEntity, bool>> filter = null,
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null, int? take = null, int? skip = null,
            string includeProperties = "")
        {
            IQueryable<TEntity> query = dbSet;

            if (filter != null) {
                query = query.Where(filter);
            }

            foreach (var includeProperty in includeProperties.Split
                (new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries)) {
                query = query.Include(includeProperty);
            }

            if (orderBy != null) {
                if (take == null) {
                    if (skip == null)
                        return orderBy(query);
                    return orderBy(query).Skip(skip.Value);
                }

	            if (skip == null)
		            return orderBy(query).Take(take.Value);
	            return orderBy(query).Skip(skip.Value).Take(take.Value);
            }

	        return query;
        }

        public virtual TEntity GetByID(object id)
        {
            return dbSet.Find(id);
        }

        public virtual void Insert(TEntity entity)
        {
            dbSet.Add(entity);
        }

        public virtual void BulkInsert(IList<TEntity> records)
        {
            context.ChangeTracker.AutoDetectChangesEnabled = false;
            dbSet.AddRange(records);            
        }
        
        public virtual void Delete(object id)
        {
            TEntity entityToDelete = dbSet.Find(id);
            if(entityToDelete != null)
                Delete(entityToDelete);
        }

        public virtual void Delete(TEntity entityToDelete)
        {
            if (context.Entry(entityToDelete).State == EntityState.Detached) {
                dbSet.Attach(entityToDelete);
            }
            dbSet.Remove(entityToDelete);
        }

        public virtual void Update(TEntity entityToUpdate)
        {
            dbSet.Attach(entityToUpdate);
            context.Entry(entityToUpdate).State = EntityState.Modified;
        }

        public virtual void LoadCollection(TEntity entity, string collName)
        {
            if (context.Entry(entity).State == EntityState.Detached)
                dbSet.Attach(entity);
            context.Entry(entity).Collection(collName).Load();
        }
		       

        public virtual void LoadReference(TEntity entity, string refName)
        {
            context.Entry(entity).Reference(refName).Load();
        }

        public virtual void Detach(TEntity entity)
        {
            context.Entry(entity).State = EntityState.Detached;
        }

        public virtual void Copy(TEntity source, TEntity destination)
        {
            context.Entry(destination).CurrentValues.SetValues(source);
        }

        public virtual void DeleteAll()
        {
            context.Database.ExecuteSqlCommand("DELETE FROM " + typeof(TEntity).Name);
        }

        public virtual void DeleteByIds(IEnumerable<int> ids, bool exclusion = false)
        {
            if (ids != null && ids.Count() > 0)
            {
                context.Database.ExecuteSqlCommand(
                    $"DELETE FROM {GetTableName()} WHERE {GetKeyName<TEntity>()} {(exclusion ? "NOT" : "")} IN ({string.Join(",", ids)})");
            }
        }

		private string GetTableName()
		{
			string sql = dbSet.ToString();
			Regex regex = new Regex("FROM (?<table>.*) AS");
			Match match = regex.Match(sql);

			string table = match.Groups["table"].Value;
			return table;
		}

		private string GetKeyName<T>()
		{
			return context.Model.FindEntityType(typeof (T)).FindPrimaryKey().Properties
				.Select(x => x.Name).Single();
			
			/*ObjectContext objectContext = ((IObjectContextAdapter)context).ObjectContext;
			ObjectSet<TEntity> set = objectContext.CreateObjectSet<TEntity>();
			var keyNames = set.EntitySet.ElementType.KeyMembers.Select(k => k.Name).ToList();
			return keyNames.Count > 0 ? keyNames[0] : string.Empty;*/
		}
    }
}
