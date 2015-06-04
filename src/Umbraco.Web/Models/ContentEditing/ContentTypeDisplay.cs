﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Umbraco.Web.Models.ContentEditing
{
    [DataContract(Name = "contentType", Namespace = "")]
    public class ContentTypeDisplay : ContentTypeBasic
    {
        public ContentTypeDisplay()
        {
            //initialize collections so at least their never null
            AllowedTemplates = new List<EntityBasic>();
            AvailableCompositeContentTypes = new List<EntityBasic>();
            AllowedContentTypes = new List<int>();
            CompositeContentTypes = new List<string>();
            Groups = new List<PropertyTypeGroupDisplay>();
        }

        //name, alias, icon, thumb, desc, inherited from basic


        // Templates
        [DataMember(Name = "allowedTemplates")]
        public IEnumerable<EntityBasic> AllowedTemplates { get; set; } 

        [DataMember(Name = "defaultTemplate")]
        public EntityBasic DefaultTemplate { get; set; }



        [DataMember(Name = "allowedContentTypes")]
        public IEnumerable<int> AllowedContentTypes { get; set; }

        //List view
        [DataMember(Name = "isContainer")]
        public bool IsContainer { get; set; }

        //we might not need this... 
        [DataMember(Name = "allowAsRoot")]
        public bool AllowAsRoot { get; set; }


        //Compositions
        [DataMember(Name = "compositeContentTypes")]
        public IEnumerable<string> CompositeContentTypes { get; set; }

        [DataMember(Name = "availableCompositeContentTypes")]
        public IEnumerable<EntityBasic> AvailableCompositeContentTypes { get; set; }


        //Tabs

        [DataMember(Name = "groups")]
        public IEnumerable<PropertyTypeGroupDisplay> Groups { get; set; }
    }
}
