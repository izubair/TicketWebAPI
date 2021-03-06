//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace TicketWebAPI.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class IssueDetail
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public IssueDetail()
        {
            this.IssueAddInfoes = new HashSet<IssueAddInfo>();
            this.Tickets = new HashSet<Ticket>();
        }
    
        public int IssueDetailId { get; set; }
        public Nullable<int> IssueID { get; set; }
        public Nullable<int> DeptID { get; set; }
        public string Details { get; set; }
    
        public virtual Dept Dept { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<IssueAddInfo> IssueAddInfoes { get; set; }
        public virtual Issue Issue { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Ticket> Tickets { get; set; }
    }
}
